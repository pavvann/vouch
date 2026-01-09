'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const { logout } = usePrivy()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
    >
      Sign Out
    </button>
  )
}
