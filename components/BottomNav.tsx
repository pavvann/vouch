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

  if (
    status !== 'authenticated' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  ) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 pb-safe">
      <div className="max-w-4xl mx-auto px-4 py-3 grid grid-cols-3 gap-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                active
                  ? 'text-white bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-2xl leading-none mb-1">{link.icon}</span>
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

