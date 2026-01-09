'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import type { LoginModalOptions } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'

const PRIVY_LOGIN_OPTIONS: LoginModalOptions = {
  loginMethods: ['email', 'sms', 'google', 'apple'],
}

type Props = {
  label?: string
  className?: string
}

export default function PrivyAuthButton({ label = 'Continue', className = '' }: Props) {
  const router = useRouter()
  const { ready, authenticated, login } = usePrivy()

  useEffect(() => {
    if (ready && authenticated) {
      router.replace('/dashboard')
      router.refresh()
    }
  }, [ready, authenticated, router])

  const handleClick = async () => {
    try {
      await login(PRIVY_LOGIN_OPTIONS)
    } catch (error) {
      console.error('Privy auth error:', error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready}
      className={`btn-primary ${className}`.trim()}
    >
      {label}
    </button>
  )
}
