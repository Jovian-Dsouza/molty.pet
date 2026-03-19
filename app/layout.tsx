import type { Metadata } from 'next'
import { Fredoka, Nunito, VT323 } from 'next/font/google'
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
  title: 'molty.pet — The Crypto Robot Desk Pet',
  description:
    'A 3D-printed robot desk pet powered by emotional voice AI. Reacts to live crypto market events with physical expressions and real DeFi voice commands.',
  openGraph: {
    title: 'molty.pet — The Crypto Robot Desk Pet',
    description:
      'Molty cries when ETH dumps, celebrates when it pumps, and can swap tokens with just its voice.',
    siteName: 'molty.pet',
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
      </body>
    </html>
  )
}
