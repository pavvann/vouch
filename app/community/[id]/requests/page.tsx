import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listJoinRequests, dismissJoinRequest, vouchUser } from '@/app/actions/community'

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

  return (
    <div className="space-y-6">
      <div>
        <p className="section-title mb-2">Access Requests</p>
        <h2 className="text-2xl font-bold text-white">Let Someone In</h2>
      </div>
      
      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🙋</div>
          <p className="text-gray-400">No pending requests</p>
          <p className="text-sm text-gray-500 mt-2">When someone requests access, they will show up here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="card-interactive flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate">
                  {req.user.name || req.user.email}
                </p>
                <p className="text-sm text-gray-400 truncate">{req.user.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  🕐 {new Date(req.createdAt).toLocaleDateString()}
                </p>
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
      )}
    </div>
  )
}

