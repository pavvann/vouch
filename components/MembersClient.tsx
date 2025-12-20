'use client'

import { useState } from 'react'
import { Role } from '@prisma/client'
import { removeMemberFromCommunity, promoteToValidator, vouchUser, dismissJoinRequest } from '@/app/actions/community'
import { useRouter } from 'next/navigation'
import { formatRole } from '@/lib/role-utils'

interface User {
  id: string
  name: string | null
  email: string
}

interface Member {
  id: string
  userId: string
  role: Role
  user: User
}

interface JoinRequest {
  id: string
  userId: string
  createdAt: Date
  user: User
}

export default function MembersClient({
  communityId,
  members,
  joinRequests,
  isCreator,
  currentUserId,
}: {
  communityId: string
  members: Member[]
  joinRequests: JoinRequest[]
  isCreator: boolean
  currentUserId: string
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    setError('')
    setLoading(userId)

    try {
      const result = await removeMemberFromCommunity(userId, communityId)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError('Failed to remove member')
    } finally {
      setLoading(null)
    }
  }

  const handlePromote = async (userId: string) => {
    setError('')
    setLoading(userId)

    try {
      const result = await promoteToValidator(userId, communityId)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError('Failed to promote member')
    } finally {
      setLoading(null)
    }
  }

  const handleVouch = async (userId: string) => {
    setError('')
    setLoading(userId)

    try {
      const result = await vouchUser(userId, communityId)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError('Failed to vouch')
    } finally {
      setLoading(null)
    }
  }

  const handleDismiss = async (userId: string) => {
    setError('')
    setLoading(userId)

    try {
      await dismissJoinRequest(communityId, userId)
      router.refresh()
    } catch (err) {
      setError('Failed to dismiss request')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-3 font-semibold transition-all ${
            activeTab === 'members'
              ? 'text-white border-b-2 border-pink-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          👥 Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-3 font-semibold transition-all relative ${
            activeTab === 'requests'
              ? 'text-white border-b-2 border-pink-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🙋 Requests ({joinRequests.length})
          {joinRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {error && (
        <div className="glass border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId
            const canManage = isCreator && !isCurrentUser && member.role !== Role.FOUNDER

            return (
              <div
                key={member.id}
                className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white truncate">
                      {member.user.name || member.user.email.split('@')[0]}
                    </p>
                    {isCurrentUser && (
                      <span className="text-xs text-gray-500">(You)</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate mb-2">{member.user.email}</p>
                  <span
                    className={`badge ${
                      member.role === Role.FOUNDER
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                        : member.role === Role.VALIDATOR
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}
                  >
                    {formatRole(member.role)}
                  </span>
                </div>

                {canManage && (
                  <div className="flex gap-2">
                    {member.role === Role.MEMBER && (
                      <button
                        onClick={() => handlePromote(member.userId)}
                        disabled={loading === member.userId}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        {loading === member.userId ? '...' : '⬆️ Promote'}
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={loading === member.userId}
                      className="btn-secondary text-sm px-4 py-2 !bg-red-500/10 hover:!bg-red-500/20 border-red-500/30 text-red-300"
                    >
                      {loading === member.userId ? '...' : '✕ Remove'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {joinRequests.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🙋</div>
              <p className="text-gray-400">No pending requests</p>
              <p className="text-sm text-gray-500 mt-2">
                When someone requests access, they'll show up here
              </p>
            </div>
          ) : (
            joinRequests.map((req) => (
              <div
                key={req.id}
                className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">
                    {req.user.name || req.user.email.split('@')[0]}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{req.user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    🕐 {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVouch(req.userId)}
                    disabled={loading === req.userId}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    {loading === req.userId ? '...' : '✨ Vouch'}
                  </button>
                  <button
                    onClick={() => handleDismiss(req.userId)}
                    disabled={loading === req.userId}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    {loading === req.userId ? '...' : '✕ Dismiss'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

