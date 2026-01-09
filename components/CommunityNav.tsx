'use client'

import { usePathname, useRouter } from 'next/navigation'

type NavItem = {
  href: string
  label: string
}

export default function CommunityNav({
  communityId,
  showSettings,
}: {
  communityId: string
  showSettings: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()

  const base = `/community/${communityId}`
  const navItems: NavItem[] = [
    { href: `${base}/chat`, label: '💬 Chat' },
    { href: `${base}/moments`, label: '✨ Moments' },
    { href: `${base}/members`, label: '👥 Members' },
  ]

  if (showSettings) {
    navItems.push({ href: `${base}/settings`, label: '⚙️ Settings' })
  }

  const handleNavigate = (href: string) => {
    if (pathname === href) {
      return
    }
    router.push(href)
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {navItems.map((item) => {
        const active = pathname?.startsWith(item.href)
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => handleNavigate(item.href)}
            className={`btn-ghost whitespace-nowrap ${
              active ? 'text-white border border-white/10 bg-white/5' : ''
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
