'use client'

import { useState } from 'react'
import { removeMemberFromCommunity, promoteToValidator } from '@/app/actions/community'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'

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

  const nonFounders = members.filter((m) => m.role !== Role.FOUNDER)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Community Settings</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Community Info</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Name:</strong> {community.name}
          </p>
          <p>
            <strong>Description:</strong> {community.description || 'None'}
          </p>
          <p>
            <strong>Required Vouches:</strong> {community.requiredVouches}
          </p>
          <p>
            <strong>Member Cooldown:</strong> {community.memberCooldownDays} days
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Members</h3>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {nonFounders.length === 0 ? (
          <p className="text-gray-600">No members yet (besides you)</p>
        ) : (
          <div className="space-y-3">
            {nonFounders.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded"
              >
                <div>
                  <p className="font-medium">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="text-sm text-gray-500">Role: {member.role}</p>
                </div>
                <div className="flex gap-2">
                  {member.role === Role.MEMBER && (
                    <button
                      onClick={() => handlePromote(member.userId)}
                      disabled={loading === member.userId}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading === member.userId ? 'Promoting...' : 'Promote to Validator'}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={loading === member.userId}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading === member.userId ? 'Removing...' : 'Remove'}
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

