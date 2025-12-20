'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'

export async function createMoment(communityId: string, content: string) {
  const user = await requireAuth()

  // Verify membership
  const membership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: user.id,
        communityId,
      },
    },
  })

  if (!membership) {
    return { error: 'You must be a member to post moments' }
  }

  await prisma.moment.create({
    data: {
      communityId,
      userId: user.id,
      content: content.trim(),
    },
  })

  revalidatePath(`/community/${communityId}/moments`)
  return { success: true }
}

export async function getMoments(communityId: string) {
  const user = await requireAuth()

  // Verify membership
  const membership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: user.id,
        communityId,
      },
    },
  })

  if (!membership) {
    return []
  }

  const moments = await prisma.moment.findMany({
    where: { communityId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return moments
}

export async function addComment(momentId: string, content: string) {
  const user = await requireAuth()

  // Verify user has access to this moment's community
  const moment = await prisma.moment.findUnique({
    where: { id: momentId },
    include: {
      community: {
        include: {
          memberships: {
            where: {
              userId: user.id,
            },
          },
        },
      },
    },
  })

  if (!moment || moment.community.memberships.length === 0) {
    return { error: 'You must be a member to comment' }
  }

  await prisma.momentComment.create({
    data: {
      momentId,
      userId: user.id,
      content: content.trim(),
    },
  })

  revalidatePath(`/community/${moment.communityId}/moments`)
  return { success: true }
}

