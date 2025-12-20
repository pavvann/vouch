'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { vouchForUser, removeMember } from '@/lib/vouch-logic'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

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
  return await vouchForUser(user.id, toUserId, communityId)
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

