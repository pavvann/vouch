'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const { logout } = usePrivy()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await logout()
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Logout failed', err)
      setError('Unable to sign out. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleLogout}
        disabled={submitting}
        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-60"
      >
        {submitting ? 'Signing Out…' : 'Sign Out'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
