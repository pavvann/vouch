import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMoments } from '@/app/actions/moments'
import MomentsClient from '@/components/MomentsClient'

export default async function MomentsPage({
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
  })

  if (!membership) {
    redirect(`/community/${params.id}`)
  }

  const moments = await getMoments(params.id)

  return <MomentsClient communityId={params.id} initialMoments={moments} />
}

