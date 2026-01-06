'use client'

import { useState } from 'react'
import { removeMemberFromCommunity, promoteToValidator, updateCommunityDiscoverability, updateCommunityFinalApproval } from '@/app/actions/community'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'
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

interface Community {
  id: string
  name: string
  description: string | null
  requiredVouches: number
  memberCooldownDays: number
  isDiscoverable: boolean
  requiresFinalApproval: boolean
}

export default function SettingsClient({
  communityId,
  community,
  members,
}: {
  communityId: string
  community: Community
  members: Member[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [discoverabilitySaving, setDiscoverabilitySaving] = useState(false)
  const [finalApprovalSaving, setFinalApprovalSaving] = useState(false)

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

  const handleToggleDiscoverability = async () => {
    setError('')
    setDiscoverabilitySaving(true)

    try {
      const result = await updateCommunityDiscoverability(
        communityId,
        !community.isDiscoverable
      )
      if ((result as any).error) {
        setError((result as any).error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError('Failed to update discoverability')
    } finally {
      setDiscoverabilitySaving(false)
    }
  }

  const handleToggleFinalApproval = async () => {
    setError('')
    setFinalApprovalSaving(true)

    try {
      const result = await updateCommunityFinalApproval(
        communityId,
        !community.requiresFinalApproval
      )
      if ((result as any).error) {
        setError((result as any).error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError('Failed to update final approval setting')
    } finally {
      setFinalApprovalSaving(false)
    }
  }

  const nonFounders = members.filter((m) => m.role !== Role.FOUNDER)

  return (
    <div className="space-y-6">
      <div>
        <p className="section-title mb-2">Settings</p>
        <h2 className="text-2xl font-bold text-white">Community Management</h2>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gradient">Community Info</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-400">Name</span>
            <span className="font-medium text-white">{community.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-400">Description</span>
            <span className="font-medium text-white">{community.description || 'None'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-400">Required Vouches</span>
            <span className="badge bg-purple-500/20 text-purple-300 border-purple-500/30">
              {community.requiredVouches}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400">Member Cooldown</span>
            <span className="badge bg-pink-500/20 text-pink-300 border-pink-500/30">
              {community.memberCooldownDays} days
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-white/5 pt-3 mt-1">
            <div>
              <span className="text-gray-400 block">Discoverability</span>
              <span className="text-xs text-gray-500">
                {community.isDiscoverable
                  ? 'This community appears on the public discover page.'
                  : 'Hidden from discover. Only accessible via direct link or membership.'}
              </span>
            </div>
            <button
              onClick={handleToggleDiscoverability}
              disabled={discoverabilitySaving}
              className="btn-secondary text-xs px-3 py-1 whitespace-nowrap"
            >
              {discoverabilitySaving
                ? 'Saving...'
                : community.isDiscoverable
                ? 'Make Hidden'
                : 'Make Discoverable'}
            </button>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-white/5 pt-3 mt-1">
            <div>
              <span className="text-gray-400 block">Final Approval Required</span>
              <span className="text-xs text-gray-500">
                {community.requiresFinalApproval
                  ? 'After users receive required vouches, creator/validator must approve before they join.'
                  : 'Users automatically join after receiving required vouches.'}
              </span>
            </div>
            <button
              onClick={handleToggleFinalApproval}
              disabled={finalApprovalSaving}
              className="btn-secondary text-xs px-3 py-1 whitespace-nowrap"
            >
              {finalApprovalSaving
                ? 'Saving...'
                : community.requiresFinalApproval
                ? 'Disable'
                : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gradient">Members</h3>
        {error && (
          <div className="glass border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {nonFounders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-gray-400">No members yet (besides you)</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nonFounders.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 glass rounded-xl"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="text-sm">
                    <span className={`badge ${
                      member.role === Role.VALIDATOR 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {formatRole(member.role)}
                    </span>
                  </p>
                </div>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

