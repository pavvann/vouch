import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatRole } from '@/lib/role-utils'

export default async function CommunityLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const communityId = params.id

  const membership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: session.user.id,
        communityId,
      },
    },
    include: {
      community: true,
    },
  })

  // Non-members should still see the base community page.
  // Only render the member navigation shell if the user is a member.
  if (!membership) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Cover Image */}
      {membership.community.coverImage && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={membership.community.coverImage}
            alt={membership.community.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="section-title mb-1">Community</p>
            <h1 className="text-3xl font-bold text-white truncate">{membership.community.name}</h1>
            <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              <span className="badge bg-purple-500/20 text-purple-300 border-purple-500/30">
                {formatRole(membership.role)}
              </span>
            </p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <Link 
            href={`/community/${communityId}/chat`}
            className="btn-ghost whitespace-nowrap"
          >
            💬 Chat
          </Link>
          <Link 
            href={`/community/${communityId}/moments`}
            className="btn-ghost whitespace-nowrap"
          >
            ✨ Moments
          </Link>
          <Link 
            href={`/community/${communityId}/members`}
            className="btn-ghost whitespace-nowrap"
          >
            👥 Members
          </Link>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 pb-6">
        {children}
      </div>
    </div>
  )
}

