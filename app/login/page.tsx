import PrivyAuthButton from '@/components/PrivyAuthButton'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <h1 className="page-header mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-lg">Sign in or create an account</p>
        </div>
        
        <div className="card space-y-4">
          <PrivyAuthButton
            label="Continue with Privy"
            className="w-full"
          />
          <p className="text-xs text-gray-500 text-center">
            One tap handles both sign in and sign up via Privy.
          </p>
        </div>
      </div>
    </div>
  )
}
