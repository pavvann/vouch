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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Let Someone In</h2>
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-gray-600">
          No requests right now.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {req.user.name || req.user.email}
                </p>
                <p className="text-sm text-gray-500">{req.user.email}</p>
                <p className="text-xs text-gray-400">
                  Requested on {new Date(req.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <form
                  action={async () => {
                    'use server'
                    await vouchUser(req.user.id, params.id)
                  }}
                >
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Vouch
                  </button>
                </form>
                <form
                  action={async () => {
                    'use server'
                    await dismissJoinRequest(params.id, req.user.id)
                  }}
                >
                  <button
                    type="submit"
                    className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                  >
                    Dismiss
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

