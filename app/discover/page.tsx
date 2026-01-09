import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import CreateCommunityButton from '@/components/CreateCommunityButton'

export default async function DiscoverPage() {
  const user = await requireAuth()

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
    where: { userId: user.id },
    select: { communityId: true },
  })
  const userMembershipIds = new Set(userMemberships.map((m) => m.communityId))

  // Vouches the user has received per community
  const userVouches = await prisma.vouch.findMany({
    where: { toUserId: user.id },
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
  const discoverable = allCommunities.filter(
    (c) => !userMembershipIds.has(c.id) && c.isDiscoverable
  )

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="section-title mb-2">Explore</p>
          <h1 className="page-header">Discover Communities</h1>
          <p className="text-gray-400 text-sm mt-2">Find new communities to join</p>
        </div>

        {discoverable.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No communities to discover</h3>
            <p className="text-gray-400 mb-6">Be the first to create one!</p>
            <CreateCommunityButton />
          </div>
        ) : (
          <div className="grid gap-4">
            {discoverable.map((community) => {
              const vouchCount = vouchCountsByCommunity.get(community.id) || 0
              const ready = vouchCount >= community.requiredVouches

              return (
                <Link
                  key={community.id}
                  href={`/community/${community.id}`}
                  className="block card-interactive overflow-hidden p-0 hover:shadow-2xl transition group"
                >
                  {community.coverImage && (
                    <div className="w-full h-32 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={community.coverImage}
                        alt={community.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1 text-white">
                          {community.name}
                        </h3>
                        {community.description && (
                          <p className="text-gray-300 text-sm mb-3">
                            {community.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                          <span className="badge bg-white/5 text-gray-300">
                            👥 {community._count.memberships} member{community._count.memberships !== 1 ? 's' : ''}
                          </span>
                          <span className="badge bg-white/5 text-gray-300">
                            ✨ {community.requiredVouches} vouch{community.requiredVouches !== 1 ? 'es' : ''}
                          </span>
                          <span className="badge bg-white/5 text-gray-300">
                            ⏱️ {community.memberCooldownDays}d cooldown
                          </span>
                        </div>
                        <div>
                          {ready ? (
                            <span className="badge-success">
                              ✓ Ready to join ({vouchCount}/{community.requiredVouches})
                            </span>
                          ) : (
                            <span className="badge-info">
                              {vouchCount}/{community.requiredVouches} vouches received
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl ml-4 group-hover:translate-x-1 transition-transform text-fuchsia-300">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

