import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import CreateCommunityButton from '@/components/CreateCommunityButton'
import { formatRole } from '@/lib/role-utils'

export default async function DashboardPage() {
  const user = await requireAuth()

  const memberships = await prisma.membership.findMany({
    where: {
      userId: user.id,
    },
    include: {
      community: {
        include: {
          _count: {
            select: { memberships: true },
          },
        },
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div>
          <p className="section-title mb-2">Dashboard</p>
          <h1 className="page-header">My Communities</h1>
        </div>

        {memberships.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🏘️</div>
            <h3 className="text-xl font-semibold mb-2">No communities yet</h3>
            <p className="text-gray-400 mb-6">Join or create one to get started</p>
            <Link href="/discover" className="btn-primary inline-block">
              Discover Communities ✨
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {memberships.map((membership) => (
              <Link
                key={membership.id}
                href={`/community/${membership.community.id}/chat`}
                className="card-interactive group overflow-hidden p-0"
              >
                {membership.community.coverImage && (
                  <div className="w-full h-32 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={membership.community.coverImage}
                      alt={membership.community.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold mb-2 group-hover:text-gradient transition-all">
                        {membership.community.name}
                      </h2>
                      {membership.community.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {membership.community.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className="badge bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {formatRole(membership.role)}
                        </span>
                        <span className="badge bg-white/5 text-gray-300">
                          {membership.community._count?.memberships || 0} members
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl ml-4 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

