import { getMessages } from '@/app/actions/messages'
import ChatClient from '@/components/ChatClient'

export default async function ChatPage({
  params,
}: {
  params: { id: string }
}) {
  const messages = await getMessages(params.id)

  return <ChatClient communityId={params.id} initialMessages={messages} />
}

