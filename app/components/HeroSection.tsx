'use client'

import { useState } from 'react'
import MoltyVideo from './MoltyVideo'
import { type Mood } from './MoltyFace'
import WaitlistForm from './WaitlistForm'

export default function HeroSection() {
  const [mood, setMood] = useState<Mood>('happy')

  function handleSuccess() {
    setMood('hyped')
  }

  return (
    <section className="relative overflow-hidden px-6 py-16 sm:py-24">
      {/* Background blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: '#6E54FF' }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: '#FF66C4' }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        {/* Left: Text + Form */}
        <div className="flex flex-1 flex-col gap-6 text-center lg:text-left">

          {/* Headline */}
          <h1 className="font-heading text-5xl font-bold leading-tight tracking-wide text-dark sm:text-6xl lg:text-7xl">
            The desk pet that{' '}
            <span
              className="inline-block rounded-lg px-2 py-0.5"
              style={{ backgroundColor: '#6E54FF', color: '#FFF5F9' }}
            >
              feels
            </span>{' '}
            every crypto move.
          </h1>

          {/* Subheadline */}
          <p className="font-body text-lg leading-relaxed text-dark/70 sm:text-xl">
            Molty is a 3D-printed robot desk pet with an emotional voice AI. It{' '}
            <strong>cries when ETH dumps</strong>, celebrates when it pumps, and can
            swap tokens with just its voice. Real DeFi. Real feelings.
          </p>

          {/* Form */}
          <div className="w-full max-w-lg self-center lg:self-start">
            <WaitlistForm onSuccess={handleSuccess} />
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-2">
              {['#FF66C4', '#6E54FF', '#5CE1E6', '#FFD93D', '#FFB347'].map((c, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-dark"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <p className="font-body text-sm font-medium text-dark/60">
              <span className="font-bold text-dark">2,341+</span> people already on the waitlist
            </p>
          </div>
        </div>

        {/* Right: Molty face */}
        <div className="relative flex shrink-0 flex-col items-center gap-4">
          {/* Animated face */}
          <div className="animate-float">
            <MoltyVideo size="lg" />
          </div>

          {/* Decorative sparks */}
          <div className="absolute -right-4 top-8 font-retro text-3xl text-primary opacity-80">
            ✦
          </div>
          <div className="absolute -left-2 bottom-12 font-retro text-2xl text-accent opacity-80">
            ✦
          </div>
          <div className="absolute right-8 bottom-4 font-retro text-xl text-cyan opacity-60">
            ✦
          </div>
        </div>
      </div>
    </section>
  )
}
