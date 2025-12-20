'use client'

import { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage } from '@/app/actions/messages'

interface Message {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
}

export default function ChatClient({
  communityId,
  initialMessages,
}: {
  communityId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newMessages = await getMessages(communityId)
        setMessages(newMessages)
      } catch (err) {
        // Silent fail for polling
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [communityId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setError('')
    setLoading(true)
    const content = input
    setInput('')

    try {
      const result = await sendMessage(communityId, content)
      if (result.error) {
        setError(result.error)
        setInput(content)
      } else {
        // Refresh messages
        const newMessages = await getMessages(communityId)
        setMessages(newMessages)
      }
    } catch (err) {
      setError('Failed to send message')
      setInput(content)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 h-[60vh] overflow-y-auto scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-500">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm text-gradient">
                    {message.user.name || message.user.email.split('@')[0]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white/90 leading-relaxed">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="glass border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-6"
        >
          {loading ? '...' : '→'}
        </button>
      </form>
    </div>
  )
}

