import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const sans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const mono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

const title = 'Molty: a robot pet for your AI agent'
const description =
  'Molty is a $150 desk quadruped that walks, waves, dances, and talks, powered by your Hermes AI agent in the cloud. Pre-orders open.'

export const metadata: Metadata = {
  metadataBase: new URL('https://molty.pet'),
  title,
  description,
  icons: {
    icon: {
      url: '/favicon.png',
      type: 'image/png',
      sizes: '64x64',
    },
    apple: {
      url: '/apple-icon.png',
      type: 'image/png',
      sizes: '180x180',
    },
  },
  openGraph: {
    title,
    description,
    siteName: 'molty.pet',
    url: 'https://molty.pet',
    type: 'website',
    images: [
      {
        url: '/molty-dog-front.jpg',
        width: 1800,
        height: 1350,
        alt: 'Molty, a red four-legged desk robot, standing on a desk.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@moltypet',
    title,
    description,
    images: ['/molty-dog-front.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${mono.variable}`}>
      <body className="min-h-full bg-background text-foreground font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
