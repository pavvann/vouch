import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getMessages } from '@/app/actions/messages'
import ChatClient from '@/components/ChatClient'

export default async function ChatPage({
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

  const messages = await getMessages(params.id)

  return <ChatClient communityId={params.id} initialMessages={messages} />
}

