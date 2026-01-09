'use client'

import { useFormState } from 'react-dom'
import type { ProfileSetupState } from './actions'

const INITIAL_STATE: ProfileSetupState = {
  error: undefined,
}

export default function ProfileSetupForm({
  action,
}: {
  action: (_state: ProfileSetupState, formData: FormData) => Promise<ProfileSetupState>
}) {
  const [state, formAction] = useFormState(action, INITIAL_STATE)

  return (
    <form action={formAction} className="space-y-5">
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
        {state?.error && (
          <p className="text-sm text-red-400 mt-2">{state.error}</p>
        )}
      </div>

      <button type="submit" className="btn-primary w-full">
        Continue
      </button>
    </form>
  )
}
