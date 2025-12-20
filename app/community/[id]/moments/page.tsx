import { getMoments } from '@/app/actions/moments'
import MomentsClient from '@/components/MomentsClient'

export default async function MomentsPage({
  params,
}: {
  params: { id: string }
}) {
  const moments = await getMoments(params.id)

  return <MomentsClient communityId={params.id} initialMoments={moments} />
}

