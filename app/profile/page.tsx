import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import LogoutButton from '@/components/LogoutButton'
import CreateCommunityButton from '@/components/CreateCommunityButton'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

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

