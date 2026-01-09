import PrivyAuthButton from '@/components/PrivyAuthButton'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <h1 className="page-header mb-2">Join Vouch</h1>
          <p className="text-gray-400 text-lg">Create your account to get started</p>
        </div>
        
        <div className="card space-y-4">
          <PrivyAuthButton
            label="Continue with Privy"
            className="w-full"
          />
          <p className="text-xs text-gray-500 text-center">
            Privy will guide you through sign up or login as needed.
          </p>
        </div>
      </div>
    </div>
  )
}
