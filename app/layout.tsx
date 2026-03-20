import type { Metadata } from 'next'
import { Fredoka, Nunito, VT323 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://molty.pet'),
  title: 'molty.pet — AI Desk Companion That Fights Loneliness',
  description:
    'Molty is a 3D-printed AI desk companion with a voice and personality. It reacts to your day, celebrates wins, nudges you when you stall, and handles tasks by voice — so you never feel alone at your desk.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'molty.pet — AI Desk Companion That Fights Loneliness',
    description:
      'A desk pet that keeps you company, reacts to your mood, and gets things done — no apps, no typing, just Molty.',
    siteName: 'molty.pet',
    url: 'https://molty.pet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'molty.pet — AI Desk Companion That Fights Loneliness',
    description:
      'A desk pet that keeps you company, reacts to your mood, and gets things done — no apps, no typing, just Molty.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} ${vt323.variable}`}
    >
      <body className="min-h-full flex flex-col bg-bg text-dark antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
