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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-16 text-center">
        <div className="space-y-6">
          <h1 className="text-8xl md:text-9xl font-black mb-6 bg-gradient-to-br from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-none">
            Vouch
          </h1>
          <p className="text-3xl md:text-4xl text-gray-200 mb-3 font-light">
            Communities built on trust
          </p>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Get vouched in. Build your circle.
          </p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <Link
            href="/login"
            className="block btn-primary w-full text-lg py-4"
          >
            ✨ Sign In
          </Link>
          <Link
            href="/register"
            className="block btn-secondary w-full text-lg py-4"
          >
            🚀 Create Account
          </Link>
        </div>

        <div className="flex items-center justify-center gap-12 text-sm text-gray-400 pt-12">
          <div className="text-center space-y-2">
            <div className="text-3xl mb-1">🤝</div>
            <div className="font-medium">Vouch-based</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl mb-1">🔒</div>
            <div className="font-medium">Private</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl mb-1">⚡</div>
            <div className="font-medium">Instant</div>
          </div>
        </div>
      </div>
    </div>
  )
}

