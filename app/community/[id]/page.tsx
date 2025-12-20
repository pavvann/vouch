import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canUserVouch } from '@/lib/vouch-logic'
import VouchButton from '@/components/VouchButton'
import Link from 'next/link'
import { requestJoin } from '@/app/actions/community'

export default async function CommunityPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const communityId = params.id

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!community) {
    return <div className="p-8">Community not found</div>
  }

  // Check if user is already a member
  const userMembership = session?.user?.id
    ? await prisma.membership.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId,
          },
        },
      })
    : null

  if (userMembership) {
    redirect(`/community/${communityId}/chat`)
  }

  // Get vouch count for current user
  const vouchCount = session?.user?.id
    ? await prisma.vouch.count({
        where: {
          toUserId: session.user.id,
          communityId,
        },
      })
    : 0

  // Get all members for vouching (exclude current user)
  const members = community.memberships
    .map((m) => m.user)
    .filter((user) => user.id !== session?.user?.id)

  // Check if user has a join request
  const existingRequest =
    session?.user?.id &&
    (await prisma.joinRequest.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: session.user.id,
        },
      },
    }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link
            href="/discover"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Discover
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
          {community.description && (
            <p className="text-gray-600 mb-4">{community.description}</p>
          )}
          <div className="text-sm text-gray-500 space-y-1">
            <p>Requires {community.requiredVouches} vouch{community.requiredVouches !== 1 ? 'es' : ''} to join</p>
            <p>Member cooldown: {community.memberCooldownDays} days</p>
          </div>
        </div>

        {!session ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">Please sign in to view this community</p>
            <a
              href="/login"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign In
            </a>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Status</h2>
              <p className="text-gray-700 mb-2">
                You have received <strong>{vouchCount}</strong> of{' '}
                <strong>{community.requiredVouches}</strong> required vouches.
              </p>
              {vouchCount >= community.requiredVouches ? (
                <p className="text-green-600 font-medium">
                  ✓ You can now join this community!
                </p>
              ) : (
                <p className="text-gray-600">
                  You need {community.requiredVouches - vouchCount} more vouch
                  {community.requiredVouches - vouchCount !== 1 ? 'es' : ''} to join.
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Get Let In</h2>
              {existingRequest ? (
                <div className="flex items-center justify-between">
                  <div className="text-green-700 text-sm">
                    Access requested. Community members can vouch to let you in.
                  </div>
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md cursor-not-allowed"
                  >
                    Requested
                  </button>
                </div>
              ) : (
                <form
                  action={async () => {
                    'use server'
                    await requestJoin(communityId)
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Let me in
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

