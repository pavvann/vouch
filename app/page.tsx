import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-12 text-center">
        <div>
          <h1 className="text-7xl font-black mb-4 bg-gradient-to-br from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Vouch
          </h1>
          <p className="text-2xl text-gray-300 mb-2">
            Communities built on trust
          </p>
          <p className="text-gray-500">
            Get vouched in. Build your circle.
          </p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <Link
            href="/login"
            className="block btn-primary w-full"
          >
            ✨ Sign In
          </Link>
          <Link
            href="/register"
            className="block btn-secondary w-full"
          >
            🚀 Create Account
          </Link>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-gray-500 pt-8">
          <div className="text-center">
            <div className="text-2xl mb-1">🤝</div>
            <div>Vouch-based</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🔒</div>
            <div>Private</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div>Instant</div>
          </div>
        </div>
      </div>
    </div>
  )
}

