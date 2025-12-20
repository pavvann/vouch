'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { vouchForUser, removeMember } from '@/lib/vouch-logic'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function requestJoin(communityId: string) {
  const user = await requireAuth()

  // already a member
  const membership = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  })
  if (membership) return { success: true }

  await prisma.joinRequest.upsert({
    where: {
      communityId_userId: { communityId, userId: user.id },
    },
    update: {},
    create: { communityId, userId: user.id },
  })

  revalidatePath(`/community/${communityId}`)
  revalidatePath(`/community/${communityId}/requests`)
  return { success: true }
}

export async function listJoinRequests(communityId: string) {
  const user = await requireAuth()

  // must be member to view
  const membership = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  })
  if (!membership) return []

  const requests = await prisma.joinRequest.findMany({
    where: { communityId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  return requests
}

export async function dismissJoinRequest(communityId: string, userId: string) {
  const user = await requireAuth()

  const membership = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  })
  if (!membership) return { error: 'Not a member' }

  await prisma.joinRequest.deleteMany({
    where: { communityId, userId },
  })
  revalidatePath(`/community/${communityId}/requests`)
  revalidatePath(`/community/${communityId}`)
  return { success: true }
}

export async function createCommunity(
  name: string,
  description: string | null,
  requiredVouches: number,
  memberCooldownDays: number
) {
  const user = await requireAuth()

  const community = await prisma.community.create({
    data: {
      name,
      description,
      requiredVouches,
      memberCooldownDays,
    },
  })

  // Create founder membership
  await prisma.membership.create({
    data: {
      userId: user.id,
      communityId: community.id,
      role: Role.FOUNDER,
    },
  })

  revalidatePath('/dashboard')
  return { success: true, communityId: community.id }
}

export async function vouchUser(toUserId: string, communityId: string) {
  const user = await requireAuth()
  const result = await vouchForUser(user.id, toUserId, communityId)
  if (result.success) {
    revalidatePath(`/community/${communityId}`)
    revalidatePath(`/community/${communityId}/requests`)
  }
  return result
}

export async function removeMemberFromCommunity(
  targetUserId: string,
  communityId: string
) {
  const user = await requireAuth()
  const result = await removeMember(communityId, targetUserId, user.id)
  if (result.success) {
    revalidatePath(`/community/${communityId}/settings`)
  }
  return result
}

export async function promoteToValidator(userId: string, communityId: string) {
  const user = await requireAuth()

  // Check if user is founder
  const membership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: user.id,
        communityId,
      },
    },
  })

  if (!membership || membership.role !== Role.FOUNDER) {
    return { error: 'Only founders can promote validators' }
  }

  await prisma.membership.update({
    where: {
      userId_communityId: {
        userId,
        communityId,
      },
    },
    data: {
      role: Role.VALIDATOR,
    },
  })

  revalidatePath(`/community/${communityId}/settings`)
  return { success: true }
}

