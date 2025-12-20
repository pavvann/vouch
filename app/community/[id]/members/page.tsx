import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import MembersClient from '@/components/MembersClient'

export default async function MembersPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: session.user.id,
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
      currentUserId={session.user.id}
    />
  )
}

