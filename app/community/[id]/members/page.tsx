import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import MembersClient from '@/components/MembersClient'

export default async function MembersPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireAuth()

  const membership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: user.id,
        communityId: params.id,
      },
    },
    include: {
      community: {
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: [
              { role: 'asc' }, // FOUNDER first, then VALIDATOR, then MEMBER
              { joinedAt: 'asc' },
            ],
          },
        },
      },
    },
  })

  if (!membership) {
    redirect(`/community/${params.id}`)
  }

  const isCreator = membership.role === Role.FOUNDER

  // Get join requests
  const joinRequests = await prisma.joinRequest.findMany({
    where: {
      communityId: params.id,
    },
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
      createdAt: 'desc',
    },
  })

  return (
    <MembersClient
      communityId={params.id}
      members={membership.community.memberships}
      joinRequests={joinRequests}
      isCreator={isCreator}
      currentUserId={user.id}
    />
  )
}

