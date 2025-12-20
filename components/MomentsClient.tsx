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
  image: string | null
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
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [commentContent, setCommentContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitMoment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !image) return

    setError('')
    setLoading(true)
    const contentToSend = content
    setContent('')

    try {
      let imageUrl: string | null = null

      // Upload image if selected
      if (image) {
        setUploadingImage(true)
        const formData = new FormData()
        formData.append('file', image)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image')
        }

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
        setUploadingImage(false)
      }

      const result = await createMoment(communityId, contentToSend, imageUrl)
      if (result.error) {
        setError(result.error)
        setContent(contentToSend)
      } else {
        setImage(null)
        setImagePreview(null)
        const newMoments = await getMoments(communityId)
        setMoments(newMoments)
      }
    } catch (err) {
      setError('Failed to create moment')
      setContent(contentToSend)
    } finally {
      setLoading(false)
      setUploadingImage(false)
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
    <div className="space-y-6">
      {/* Create Moment */}
      <div className="glass rounded-2xl p-6">
        <form onSubmit={handleSubmitMoment} className="space-y-4">
          {error && (
            <div className="glass border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Image Upload */}
          {imagePreview ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Moment preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null)
                  setImagePreview(null)
                }}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold"
              >
                ✕ Remove Image
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-white/10 hover:border-pink-500/50 cursor-pointer bg-white/5 hover:bg-white/10 transition-all">
              <div className="flex flex-col items-center justify-center">
                <p className="text-3xl mb-2">📸</p>
                <p className="text-xs text-gray-400">Add an image (optional)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a moment..."
            rows={3}
            className="input resize-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || uploadingImage || (!content.trim() && !image)}
            className="btn-primary w-full"
          >
            {uploadingImage ? '📤 Uploading...' : loading ? 'Posting...' : '✨ Post Moment'}
          </button>
        </form>
      </div>

      {/* Moments List */}
      <div className="space-y-4">
        {moments.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-gray-400 mb-2">No moments yet</p>
            <p className="text-sm text-gray-500">Be the first to share!</p>
          </div>
        ) : (
          moments.map((moment) => (
            <div key={moment.id} className="card">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-gradient">
                    {moment.user.name || moment.user.email.split('@')[0]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(moment.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {moment.image && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={moment.image}
                      alt="Moment"
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}

                {moment.content && (
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {moment.content}
                  </p>
                )}
              </div>

              {/* Comments */}
              {moment.comments.length > 0 && (
                <div className="space-y-3 mb-4 border-t border-white/10 pt-4">
                  {moment.comments.map((comment) => (
                    <div key={comment.id} className="pl-4 border-l-2 border-pink-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-pink-300">
                          {comment.user.name || comment.user.email.split('@')[0]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
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
                  className="input flex-1 text-sm py-2"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !commentContent[moment.id]?.trim()}
                  className="btn-secondary text-sm px-4"
                >
                  💬
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

