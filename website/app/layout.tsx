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

export const metadata: Metadata = {
  metadataBase: new URL('https://molty.pet'),
  title: 'Molty — Build a Robot Pet. Give Your AI a Body.',
  description:
    'Molty is an open-source, Raspberry Pi robot pet you build yourself—then talk to, teach, and connect to your AI agents. Follow the prototype from first steps to expressive companion.',
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
    title: 'Build a Robot Pet. Give Your AI a Body.',
    description:
      'Meet Molty: an open robot pet you build yourself, grow attached to, and connect to your AI agents.',
    siteName: 'molty.pet',
    url: 'https://molty.pet',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Molty, an open-source robot pet you can build yourself.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@moltypet',
    title: 'Build a Robot Pet. Give Your AI a Body.',
    description:
      'Meet Molty: an open robot pet you build yourself, grow attached to, and connect to your AI agents.',
    images: ['/og.png'],
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
