import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ProfileSetupPage() {
  const user = await requireAuth({ allowIncompleteProfile: true })

  if (user.name) {
    redirect('/dashboard')
  }

  async function completeProfile(formData: FormData) {
    'use server'

    const name = (formData.get('name') as string)?.trim()
    if (!name) {
      return
    }

    const authedUser = await requireAuth({ allowIncompleteProfile: true })
    await prisma.user.update({
      where: { id: authedUser.id },
      data: { name },
    })

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
          <form action={completeProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={64}
                autoComplete="name"
                placeholder="e.g. Maya Patel"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/80 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Continue
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center">
            You can update this later from your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}
