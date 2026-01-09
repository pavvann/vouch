import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getMoments } from '@/app/actions/moments'
import MomentsClient from '@/components/MomentsClient'

export default async function MomentsPage({
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
  })

  if (!membership) {
    redirect(`/community/${params.id}`)
  }

  const moments = await getMoments(params.id)

  return <MomentsClient communityId={params.id} initialMoments={moments} />
}

