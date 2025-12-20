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
        setSuccess(true) // optimistic success state
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

  return (
    <div className="flex items-center justify-between p-3 border border-slate-800 rounded-xl bg-slate-900/60">
      <span className="text-gray-100">{targetUserName}</span>
      <div className="flex items-center gap-2">
        {error && <span className="text-red-400 text-sm">{error}</span>}
        <button
          onClick={handleVouch}
          disabled={loading || success}
          className={`px-3 py-1 text-sm rounded-lg transition whitespace-nowrap ${
            success
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 cursor-default'
              : 'bg-gradient-to-r from-fuchsia-500 via-rose-500 to-purple-600 text-white shadow-md hover:brightness-110 disabled:opacity-60'
          }`}
        >
          {success ? '✓ Vouched' : loading ? 'Vouching...' : 'Vouch'}
        </button>
      </div>
    </div>
  )
}

