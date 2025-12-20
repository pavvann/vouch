import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMessages } from '@/app/actions/messages'
import ChatClient from '@/components/ChatClient'

export default async function ChatPage({
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

  const messages = await getMessages(params.id)

  return <ChatClient communityId={params.id} initialMessages={messages} />
}

