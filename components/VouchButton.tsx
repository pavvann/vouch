'use client'

import { useState } from 'react'
import { vouchUser } from '@/app/actions/community'
import { useRouter } from 'next/navigation'

export default function VouchButton({
  targetUserId,
  targetUserName,
  communityId,
}: {
  targetUserId: string
  targetUserName: string
  communityId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleVouch = async () => {
    setError('')
    setLoading(true)

    try {
      const result = await vouchUser(targetUserId, communityId)
      if (result.success) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(result.error || 'Failed to vouch')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
        <span className="text-gray-700">{targetUserName}</span>
        <span className="text-green-600 text-sm">✓ Vouched</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
      <span className="text-gray-700">{targetUserName}</span>
      <div className="flex items-center gap-2">
        {error && <span className="text-red-600 text-sm">{error}</span>}
        <button
          onClick={handleVouch}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Vouching...' : 'Vouch'}
        </button>
      </div>
    </div>
  )
}

