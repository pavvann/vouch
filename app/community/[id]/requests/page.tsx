import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listJoinRequests, dismissJoinRequest, vouchUser, approvePendingApproval, rejectPendingApproval } from '@/app/actions/community'
import { Role, JoinRequestStatus } from '@prisma/client'

export default async function RequestsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const membership = await prisma.membership.findUnique({
    where: {
      userId_communityId: { userId: session.user.id, communityId: params.id },
    },
    include: { community: true },
  })

  if (!membership) {
    redirect(`/community/${params.id}`)
  }

  const requests = await listJoinRequests(params.id)
  
  // Get vouch counts for each request
  const requestsWithVouches = await Promise.all(
    requests.map(async (req) => {
      const vouchCount = await prisma.vouch.count({
        where: {
          toUserId: req.user.id,
          communityId: params.id,
        },
      })
      return { ...req, vouchCount }
    })
  )

  const pendingVouches = requestsWithVouches.filter(
    (req) => req.status === JoinRequestStatus.PENDING_VOUCHES
  )
  const pendingApprovals = requestsWithVouches.filter(
    (req) => req.status === JoinRequestStatus.PENDING_APPROVAL
  )

  const canApprove = membership.role === Role.FOUNDER || membership.role === Role.VALIDATOR

  return (
    <div className="space-y-6">
      <div>
        <p className="section-title mb-2">Access Requests</p>
        <h2 className="text-2xl font-bold text-white">Let Someone In</h2>
      </div>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            ⏳ Pending Approval ({pendingApprovals.length})
          </h3>
          <p className="text-sm text-gray-400">
            These users have received enough vouches and are waiting for creator/validator approval.
          </p>
          <div className="space-y-3">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="card-interactive flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">
                    {req.user.name || req.user.email}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{req.user.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="badge-success text-xs">
                      ✓ {req.vouchCount}/{membership.community.requiredVouches} vouches
                    </span>
                    <span className="text-xs text-gray-500">
                      🕐 {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {canApprove && (
                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        'use server'
                        await approvePendingApproval(params.id, req.user.id)
                      }}
                    >
                      <button type="submit" className="btn-primary text-sm px-4 py-2">
                        ✓ Approve
                      </button>
                    </form>
                    <form
                      action={async () => {
                        'use server'
                        await rejectPendingApproval(params.id, req.user.id)
                      }}
                    >
                      <button type="submit" className="btn-secondary text-sm px-4 py-2 !bg-red-500/10 hover:!bg-red-500/20 border-red-500/30 text-red-300">
                        ✕ Reject
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Vouches Section */}
      {pendingVouches.length > 0 && (
        <div className="space-y-4">
          {pendingApprovals.length > 0 && <div className="border-t border-white/10 pt-6" />}
          <h3 className="text-lg font-semibold text-white">
            🙋 Waiting for Vouches ({pendingVouches.length})
          </h3>
          <div className="space-y-3">
            {pendingVouches.map((req) => (
              <div
                key={req.id}
                className="card-interactive flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">
                    {req.user.name || req.user.email}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{req.user.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="badge-info text-xs">
                      {req.vouchCount}/{membership.community.requiredVouches} vouches
                    </span>
                    <span className="text-xs text-gray-500">
                      🕐 {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      'use server'
                      await vouchUser(req.user.id, params.id)
                    }}
                  >
                    <button type="submit" className="btn-primary text-sm px-4 py-2">
                      ✨ Vouch
                    </button>
                  </form>
                  <form
                    action={async () => {
                      'use server'
                      await dismissJoinRequest(params.id, req.user.id)
                    }}
                  >
                    <button type="submit" className="btn-secondary text-sm px-4 py-2">
                      ✕ Dismiss
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🙋</div>
          <p className="text-gray-400">No pending requests</p>
          <p className="text-sm text-gray-500 mt-2">When someone requests access, they will show up here</p>
        </div>
      )}
    </div>
  )
}

