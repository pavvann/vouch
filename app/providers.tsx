'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { privyConfig } from '@/lib/privy'

export function Providers({ children }: { children: React.ReactNode }) {
  if (!privyConfig.appId) {
    const message = 'NEXT_PUBLIC_PRIVY_APP_ID is not set. Add it to your environment to enable Privy auth.'
    if (process.env.NODE_ENV === 'development') {
      throw new Error(message)
    }
    console.error(message)
    return <>{children}</>
  }

  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      {children}
    </PrivyProvider>
  )
}
