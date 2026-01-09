// Privy configuration
// Get your App ID from https://dashboard.privy.io

export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  config: {
    // Login methods
    loginMethods: ['email', 'sms'],
    
    // Embedded wallets - automatically created for all users
    embeddedWallets: {
      createOnLogin: 'users-without-wallets', // Create wallet for users who don't have one
      requireUserPasswordOnCreate: false, // No password needed for wallet creation
      noPromptOnSignature: false, // Show prompts for wallet actions
    },
    
    // Appearance
    appearance: {
      theme: 'dark',
      accentColor: '#ec4899', // Pink to match Vouch theme
      logo: '/icon-192.png',
    },
    
    // Legal
    legal: {
      termsAndConditionsUrl: undefined,
      privacyPolicyUrl: undefined,
    },
  },
}


