import { requireAuth } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import ProfileSetupForm from './ProfileSetupForm'
import { completeProfileAction } from './actions'

export default async function ProfileSetupPage() {
  const user = await requireAuth({ allowIncompleteProfile: true })

  if (user.name) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <p className="section-title">Complete Profile</p>
          <h1 className="page-header">Tell us your name</h1>
          <p className="text-gray-400 text-sm">
            We&apos;ll show this name to other community members.
          </p>
        </div>

        <div className="card space-y-6">
          <ProfileSetupForm action={completeProfileAction} />

          <p className="text-xs text-gray-500 text-center">
            You can update this later from your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}
