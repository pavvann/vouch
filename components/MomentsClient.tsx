'use client'

import { useState, useEffect, useRef } from 'react'
import { getMoments, createMoment, addComment } from '@/app/actions/moments'

interface MomentComment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface Moment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
  comments: MomentComment[]
}

export default function MomentsClient({
  communityId,
  initialMoments,
}: {
  communityId: string
  initialMoments: Moment[]
}) {
  const [moments, setMoments] = useState<Moment[]>(initialMoments)
  const [content, setContent] = useState('')
  const [commentContent, setCommentContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Poll for new moments every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newMoments = await getMoments(communityId)
        setMoments(newMoments)
      } catch (err) {
        // Silent fail for polling
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [communityId])

  const handleSubmitMoment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setError('')
    setLoading(true)
    const contentToSend = content
    setContent('')

    try {
      const result = await createMoment(communityId, contentToSend)
      if (result.error) {
        setError(result.error)
        setContent(contentToSend)
      } else {
        const newMoments = await getMoments(communityId)
        setMoments(newMoments)
      }
    } catch (err) {
      setError('Failed to create moment')
      setContent(contentToSend)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (momentId: string) => {
    const content = commentContent[momentId]
    if (!content?.trim()) return

    setError('')
    setLoading(true)

    try {
      const result = await addComment(momentId, content)
      if (result.error) {
        setError(result.error)
      } else {
        setCommentContent({ ...commentContent, [momentId]: '' })
        const newMoments = await getMoments(communityId)
        setMoments(newMoments)
      }
    } catch (err) {
      setError('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Moments</h2>
        <form onSubmit={handleSubmitMoment} className="mb-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a moment..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Moment'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {moments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No moments yet. Be the first to share!</p>
        ) : (
          moments.map((moment) => (
            <div key={moment.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-3">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-medium">
                    {moment.user.name || moment.user.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(moment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{moment.content}</p>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="space-y-3 mb-4">
                  {moment.comments.map((comment) => (
                    <div key={comment.id} className="pl-4 border-l-2 border-gray-200">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.user.name || comment.user.email}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmitComment(moment.id)
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={commentContent[moment.id] || ''}
                    onChange={(e) =>
                      setCommentContent({
                        ...commentContent,
                        [moment.id]: e.target.value,
                      })
                    }
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !commentContent[moment.id]?.trim()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
                  >
                    Comment
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

