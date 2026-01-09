'use server'

import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export type ProfileSetupState = {
  error?: string
}

export async function completeProfileAction(
  _prevState: ProfileSetupState,
  formData: FormData
): Promise<ProfileSetupState> {
  const name = (formData.get('name') as string | null)?.trim()
  if (!name) {
    return { error: 'Please enter your name before continuing.' }
  }

  const authedUser = await requireAuth({ allowIncompleteProfile: true })
  await prisma.user.update({
    where: { id: authedUser.id },
    data: { name },
  })

  redirect('/dashboard')
}
