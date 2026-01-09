import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import LogoutButton from '@/components/LogoutButton'
import CreateCommunityButton from '@/components/CreateCommunityButton'

export default async function ProfilePage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 pb-24 md:pb-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-fuchsia-400 font-semibold">Profile</p>
          <h1 className="text-3xl font-bold text-white">Your Account</h1>
        </div>

        <div className="card space-y-3">
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="text-lg font-semibold text-white">{user?.name || 'No name set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="text-lg font-semibold text-white">{user?.email}</p>
          </div>
          <div className="flex gap-3 flex-wrap pt-2">
            <CreateCommunityButton />
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  )
}

