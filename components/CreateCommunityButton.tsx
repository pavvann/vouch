'use client'

import Link from 'next/link'

export default function CreateCommunityButton() {
  return (
    <Link href="/create-community" className="btn-primary inline-block">
      ✨ Create Community
    </Link>
  )
}

