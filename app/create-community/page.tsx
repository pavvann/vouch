'use client'

import { useState } from 'react'
import { createCommunity } from '@/app/actions/community'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateCommunityPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [requiredVouches, setRequiredVouches] = useState(2)
  const [memberCooldownDays, setMemberCooldownDays] = useState(30)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let coverImageUrl: string | null = null

      // Upload image if selected
      if (coverImage) {
        setUploadingImage(true)
        const formData = new FormData()
        formData.append('file', coverImage)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image')
        }

        const uploadData = await uploadRes.json()
        coverImageUrl = uploadData.url
        setUploadingImage(false)
      }

      const result = await createCommunity(
        name,
        description || null,
        requiredVouches,
        memberCooldownDays,
        coverImageUrl
      )

      if (result.success) {
        router.push(`/community/${result.communityId}/chat`)
        router.refresh()
      } else {
        setError('Failed to create community')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <Link href="/profile" className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-2">
            ← Back
          </Link>
          <p className="section-title mb-2 mt-4">New Community</p>
          <h1 className="page-header">Create Community</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="glass border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Cover Image Upload */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Cover Image (Optional)
            </label>
            <div className="relative">
              {coverImagePreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null)
                      setCoverImagePreview(null)
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold"
                  >
                    ✕ Remove Image
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-white/20 hover:border-pink-500/50 cursor-pointer bg-white/5 hover:bg-white/10 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="text-6xl mb-3">🖼️</p>
                    <p className="text-sm text-gray-300 font-medium">Click to upload cover image</p>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="card space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Community Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Enter community name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input resize-none"
                rows={4}
                placeholder="What's your community about?"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="card space-y-5">
            <h3 className="text-lg font-semibold text-gradient">Community Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Required Vouches
              </label>
              <p className="text-xs text-gray-500 mb-3">
                How many vouches needed to join this community
              </p>
              <select
                value={requiredVouches}
                onChange={(e) => setRequiredVouches(Number(e.target.value))}
                className="input"
              >
                <option value={1}>1 vouch (Less exclusive)</option>
                <option value={2}>2 vouches (Balanced)</option>
                <option value={3}>3 vouches (More exclusive)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Member Cooldown
              </label>
              <p className="text-xs text-gray-500 mb-3">
                How long members wait between vouches
              </p>
              <select
                value={memberCooldownDays}
                onChange={(e) => setMemberCooldownDays(Number(e.target.value))}
                className="input"
              >
                <option value={7}>7 days (More vouches)</option>
                <option value={30}>30 days (Fewer vouches)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/profile"
              className="flex-1 btn-secondary text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 btn-primary"
            >
              {uploadingImage ? '📤 Uploading...' : loading ? '✨ Creating...' : '✨ Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

