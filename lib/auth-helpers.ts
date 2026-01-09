import 'server-only'

import { PrivyClient } from '@privy-io/server-auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './prisma'
import type { User } from '@prisma/client'

const PRIVY_APP_ID = process.env.PRIVY_APP_ID || process.env.NEXT_PUBLIC_PRIVY_APP_ID
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET

const privyClient = PRIVY_APP_ID && PRIVY_APP_SECRET
  ? new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET)
  : null

function getPrivyTokenFromCookies() {
  const token = cookies().get('privy-token')?.value
  return token
}

// Get Privy user info from access token
async function getPrivyUserInfo() {
  if (!privyClient) {
    console.error('Privy client is not configured. Check env vars.')
    return null
  }

  const token = getPrivyTokenFromCookies()
  if (!token) {
    return null
  }

  try {
    const claims = await privyClient.verifyAuthToken(token)
    if (!claims?.userId) {
      console.log('No userId in Privy token claims')
      return null
    }

    const privyUser = await privyClient.getUser(claims.userId)
    if (!privyUser) {
      console.log('Privy user not found for authenticated token')
      return null
    }

    return {
      privyUserId: claims.userId,
      privyUser,
    }
  } catch (error) {
    console.error('Error verifying Privy auth token:', error)
    return null
  }
}

type PrivyLinkedAccount = {
  type?: string
  walletClientType?: string
  address?: string
  name?: string | null
}

function getLinkedAccounts(privyUser: any): PrivyLinkedAccount[] {
  return Array.isArray(privyUser?.linkedAccounts) ? privyUser.linkedAccounts : []
}

function getEmailAccount(linkedAccounts: PrivyLinkedAccount[]) {
  return linkedAccounts.find((acc) => acc.type === 'email')
}

function getPrivyWalletAccount(linkedAccounts: PrivyLinkedAccount[]) {
  return linkedAccounts.find(
    (acc) => acc.type === 'wallet' && acc.walletClientType === 'privy'
  )
}

async function ensureWalletAddress(user: User, walletAddress: string | null): Promise<User> {
  if (!walletAddress || user.walletAddress) {
    return user
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { walletAddress },
  })
}

// Get or create user in our database from Privy user
async function getOrCreateUserFromPrivy(privyUserId: string, privyUser: any) {
  const linkedAccounts = getLinkedAccounts(privyUser)
  const emailAccount = getEmailAccount(linkedAccounts)
  const walletAccount = getPrivyWalletAccount(linkedAccounts)
  const email = emailAccount?.address
  const walletAddress = walletAccount?.address || null
  const defaultName = emailAccount?.name || privyUser.name || null

  // Find user by Privy ID first
  let user: User | null = await prisma.user.findUnique({
    where: { privyUserId },
  })

  if (user) {
    return ensureWalletAddress(user, walletAddress)
  }

  if (email) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { privyUserId },
      })
      return ensureWalletAddress(user, walletAddress)
    }
  }

  // If still no user, create new one
  if (!user) {
    if (!email) {
      // Can't create user without email
      return null
    }

    user = await prisma.user.create({
      data: {
        email,
        name: defaultName,
        privyUserId,
        walletAddress: walletAddress || null,
      },
    })
  }

  return user
}

export async function getCurrentUser() {
  const privyInfo = await getPrivyUserInfo()
  if (!privyInfo) {
    return null
  }

  return await getOrCreateUserFromPrivy(privyInfo.privyUserId, privyInfo.privyUser)
}

type RequireAuthOptions = {
  allowIncompleteProfile?: boolean
}

export async function requireAuth(options: RequireAuthOptions = {}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  if (!user.name && !options.allowIncompleteProfile) {
    redirect('/profile/setup')
  }

  return user
}
