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
  title: 'Molty — A Sentient Robot Dog With Two Minds',
  description:
    'Molty is a Raspberry Pi-powered quadruped exploring fast neural motion control, slow LLM planning, and continuous learning in a physical pet.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Molty — Fast Reflexes. Slow Thoughts.',
    description:
      'A Raspberry Pi-powered robot dog exploring neural motion, LLM reasoning, and continuous learning.',
    siteName: 'molty.pet',
    url: 'https://molty.pet',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Molty robot dog — Fast reflexes. Slow thoughts.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@DsouzaJovian',
    title: 'Molty — Fast Reflexes. Slow Thoughts.',
    description:
      'A Raspberry Pi-powered robot dog exploring neural motion, LLM reasoning, and continuous learning.',
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
