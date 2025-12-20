'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'

export async function sendMessage(communityId: string, content: string) {
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
    return { error: 'You must be a member to send messages' }
  }

  await prisma.message.create({
    data: {
      communityId,
      userId: user.id,
      content: content.trim(),
    },
  })

  revalidatePath(`/community/${communityId}/chat`)
  return { success: true }
}

export async function getMessages(communityId: string) {
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

  const messages = await prisma.message.findMany({
    where: { communityId },
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
  })

  return messages
}

