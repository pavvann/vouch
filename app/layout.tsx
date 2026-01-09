import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vouch',
  description: 'Vouch-based community platform',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vouch" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <BottomNav />
        </Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
