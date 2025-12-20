import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">{membership.community.name}</h1>
              <p className="text-sm text-gray-600">Role: {membership.role}</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
          <nav className="flex gap-4 border-t pt-4">
            <Link
              href={`/community/${communityId}/chat`}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Chat
            </Link>
            <Link
              href={`/community/${communityId}/moments`}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Moments
            </Link>
            <Link
              href={`/community/${communityId}/requests`}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Let Someone In
            </Link>
            {membership.role === 'FOUNDER' && (
              <Link
                href={`/community/${communityId}/settings`}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Settings
              </Link>
            )}
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
}

