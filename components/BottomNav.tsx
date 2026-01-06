'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const links = [
  { href: '/dashboard', label: 'Communities', icon: '🏘️' },
  { href: '/discover', label: 'Discover', icon: '🔍' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export default function BottomNav() {
  const { status } = useSession()
  const pathname = usePathname()

  // Don't show on auth pages or when not authenticated
  if (status !== 'authenticated') {
    return null
  }

  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/[0.08] pb-safe">
      <div className="max-w-4xl mx-auto px-4 py-3 grid grid-cols-3 gap-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 ease-out ${
                active
                  ? 'text-white bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-500/20 border border-pink-500/30 shadow-lg shadow-pink-500/10'
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span className="text-2xl leading-none mb-1">{link.icon}</span>
              <span className="text-xs font-semibold">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

