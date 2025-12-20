import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import LogoutButton from '@/components/LogoutButton'
import CreateCommunityButton from '@/components/CreateCommunityButton'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const memberships = await prisma.membership.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      community: true,
    },
    orderBy: {
      joinedAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Communities</h1>
          <div className="flex gap-4">
            <Link
              href="/discover"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Discover
            </Link>
            <CreateCommunityButton />
            <LogoutButton />
          </div>
        </div>

        {memberships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You're not a member of any communities yet.</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/discover"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Discover Communities
              </Link>
              <CreateCommunityButton />
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {memberships.map((membership) => (
              <Link
                key={membership.id}
                href={`/community/${membership.community.id}/chat`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">
                      {membership.community.name}
                    </h2>
                    {membership.community.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {membership.community.description}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Role: {membership.role}</span>
                      <span>
                        Requires {membership.community.requiredVouches} vouch
                        {membership.community.requiredVouches !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>
                  <span className="text-blue-600">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

