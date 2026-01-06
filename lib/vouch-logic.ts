import { prisma } from './prisma'
import { Role, JoinRequestStatus } from '@prisma/client'

export async function canUserVouch(
  userId: string,
  communityId: string
): Promise<{ canVouch: boolean; reason?: string; cooldownEndsAt?: Date }> {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId,
        communityId,
      },
    },
    include: {
      community: true,
    },
  })

  if (!membership) {
    return { canVouch: false, reason: 'You must be a member to vouch' }
  }

  // Founders have unlimited vouches
  if (membership.role === Role.FOUNDER) {
    return { canVouch: true }
  }

  // Calculate cooldown
  let cooldownDays = 7 // VALIDATOR default
  if (membership.role === Role.MEMBER) {
    cooldownDays = membership.community.memberCooldownDays
  }

  // Apply penalty if exists
  if (membership.cooldownPenalty) {
    cooldownDays *= 2
  }

  // Check if still in cooldown
  if (membership.lastVouchAt) {
    const cooldownEndsAt = new Date(membership.lastVouchAt)
    cooldownEndsAt.setDate(cooldownEndsAt.getDate() + cooldownDays)

    if (cooldownEndsAt > new Date()) {
      return {
        canVouch: false,
        reason: `You are in cooldown. You can vouch again on ${cooldownEndsAt.toLocaleDateString()}`,
        cooldownEndsAt,
      }
    }
  }

  return { canVouch: true }
}

export async function vouchForUser(
  fromUserId: string,
  toUserId: string,
  communityId: string
): Promise<{ success: boolean; error?: string }> {
  // Prevent self-vouching
  if (fromUserId === toUserId) {
    return { success: false, error: 'You cannot vouch for yourself' }
  }

  // Check if user can vouch
  const check = await canUserVouch(fromUserId, communityId)
  if (!check.canVouch) {
    return { success: false, error: check.reason || 'Cannot vouch' }
  }

  // Check if already vouched
  const existingVouch = await prisma.vouch.findUnique({
    where: {
      fromUserId_toUserId_communityId: {
        fromUserId,
        toUserId,
        communityId,
      },
    },
  })

  if (existingVouch) {
    return { success: false, error: 'You have already vouched for this user' }
  }

  // Fetch voucher membership to know role
  const voucherMembership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: fromUserId,
        communityId,
      },
    },
  })

  // Check if target user is already a member
  const targetMembership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: toUserId,
        communityId,
      },
    },
  })

  if (targetMembership) {
    return { success: false, error: 'User is already a member' }
  }

  // Create vouch
  await prisma.vouch.create({
    data: {
      fromUserId,
      toUserId,
      communityId,
    },
  })

  // Update lastVouchAt and reset penalty if it was set
  const membership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: fromUserId,
        communityId,
      },
    },
  })

  if (membership) {
    await prisma.membership.update({
      where: {
        userId_communityId: {
          userId: fromUserId,
          communityId,
        },
      },
      data: {
        lastVouchAt: new Date(),
        cooldownPenalty: false, // Reset penalty after successful vouch
      },
    })
  }

  // Veto path: founders and validators instantly admit the user
  if (
    voucherMembership &&
    (voucherMembership.role === Role.FOUNDER || voucherMembership.role === Role.VALIDATOR)
  ) {
    await prisma.membership.create({
      data: {
        userId: toUserId,
        communityId,
        role: Role.MEMBER,
      },
    })

    await prisma.joinRequest.deleteMany({
      where: { communityId, userId: toUserId },
    })

    return { success: true }
  }

  // Check if user can now join
  const vouchCount = await prisma.vouch.count({
    where: {
      toUserId,
      communityId,
    },
  })

  const community = await prisma.community.findUnique({
    where: { id: communityId },
  })

  if (community && vouchCount >= community.requiredVouches) {
    // Check if final approval is required
    if (community.requiresFinalApproval) {
      // Mark join request as pending approval instead of auto-joining
      await prisma.joinRequest.updateMany({
        where: { communityId, userId: toUserId },
        data: { status: JoinRequestStatus.PENDING_APPROVAL },
      })
    } else {
      // Auto-join the user (original behavior)
      await prisma.membership.create({
        data: {
          userId: toUserId,
          communityId,
          role: Role.MEMBER,
        },
      })

      // Clean up any join requests for this user/community
      await prisma.joinRequest.deleteMany({
        where: { communityId, userId: toUserId },
      })
    }
  }

  return { success: true }
}

export async function removeMember(
  communityId: string,
  targetUserId: string,
  removerUserId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if remover is founder
  const removerMembership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: removerUserId,
        communityId,
      },
    },
  })

  if (!removerMembership || removerMembership.role !== Role.FOUNDER) {
    return { success: false, error: 'Only founders can remove members' }
  }

  // Get all users who vouched for the target
  const vouches = await prisma.vouch.findMany({
    where: {
      toUserId: targetUserId,
      communityId,
    },
  })

  // Delete membership
  await prisma.membership.delete({
    where: {
      userId_communityId: {
        userId: targetUserId,
        communityId,
      },
    },
  })

  // Apply penalty to all vouchers
  for (const vouch of vouches) {
    await prisma.membership.updateMany({
      where: {
        userId: vouch.fromUserId,
        communityId,
        cooldownPenalty: false, // Only apply if not already penalized
      },
      data: {
        cooldownPenalty: true,
      },
    })
  }

  return { success: true }
}

