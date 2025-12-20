import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import SettingsClient from '@/components/SettingsClient'

export default async function SettingsPage({
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
          },
        },
      },
    },
  })

  if (!membership || membership.role !== Role.FOUNDER) {
    redirect(`/community/${params.id}/chat`)
  }

  return (
    <SettingsClient
      communityId={params.id}
      community={membership.community}
      members={membership.community.memberships.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        user: m.user,
      }))}
    />
  )
}

