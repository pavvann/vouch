import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import CreateCommunityButton from '@/components/CreateCommunityButton'

export default async function DiscoverPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  // All communities with member counts
  const allCommunities = await prisma.community.findMany({
    include: {
      memberships: {
        select: { userId: true },
      },
      _count: {
        select: { memberships: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // User memberships
  const userMemberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    select: { communityId: true },
  })
  const userMembershipIds = new Set(userMemberships.map((m) => m.communityId))

  // Vouches the user has received per community
  const userVouches = await prisma.vouch.findMany({
    where: { toUserId: session.user.id },
    select: { communityId: true },
  })
  const vouchCountsByCommunity = new Map<string, number>()
  for (const vouch of userVouches) {
    vouchCountsByCommunity.set(
      vouch.communityId,
      (vouchCountsByCommunity.get(vouch.communityId) || 0) + 1
    )
  }

  const joined = allCommunities.filter((c) => userMembershipIds.has(c.id))
  const discoverable = allCommunities.filter((c) => !userMembershipIds.has(c.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Discover Communities</h1>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              My Communities
            </Link>
            <CreateCommunityButton />
            <LogoutButton />
          </div>
        </div>

        {discoverable.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No communities to discover yet.</p>
            <CreateCommunityButton />
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-700">
              Available Communities
            </h2>
            <div className="grid gap-4">
              {discoverable.map((community) => {
                const vouchCount = vouchCountsByCommunity.get(community.id) || 0
                const ready = vouchCount >= community.requiredVouches

                return (
                  <Link
                    key={community.id}
                    href={`/community/${community.id}`}
                    className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">
                          {community.name}
                        </h3>
                        {community.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {community.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-sm text-gray-500 mb-2">
                          <span>
                            {community._count.memberships} member
                            {community._count.memberships !== 1 ? 's' : ''}
                          </span>
                          <span>
                            Requires {community.requiredVouches} vouch
                            {community.requiredVouches !== 1 ? 'es' : ''}
                          </span>
                          <span>Cooldown: {community.memberCooldownDays} days</span>
                        </div>
                        <div className="mt-3">
                          {ready ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                              ✓ Ready to join ({vouchCount}/{community.requiredVouches})
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                              {vouchCount}/{community.requiredVouches} vouches received
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-blue-600 ml-4">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {joined.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Your Communities
            </h2>
            <div className="grid gap-4">
              {joined.map((community) => (
                <Link
                  key={community.id}
                  href={`/community/${community.id}/chat`}
                  className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {community.name}
                      </h3>
                      {community.description && (
                        <p className="text-gray-600 text-sm mb-2">
                          {community.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>
                          {community._count.memberships} member
                          {community._count.memberships !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-blue-600">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

