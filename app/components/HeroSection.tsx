'use client'

import { useState, useEffect } from 'react'
import MoltyVideo from './MoltyVideo'
import { type Mood } from './MoltyFace'
import WaitlistForm from './WaitlistForm'

const VERBS = ['feels', 'trades', 'reacts', 'talks', 'executes', 'evolves', 'thinks']
const TYPE_SPEED = 80
const DELETE_SPEED = 50
const PAUSE_MS = 1800

export default function HeroSection() {
  const [mood, setMood] = useState<Mood>('happy')
  const [displayed, setDisplayed] = useState(VERBS[0])
  const [verbIndex, setVerbIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('pausing')

  useEffect(() => {
    const target = VERBS[verbIndex]

    if (phase === 'pausing') {
      const t = setTimeout(() => setPhase('deleting'), PAUSE_MS)
      return () => clearTimeout(t)
    }

    if (phase === 'deleting') {
      if (displayed.length === 0) {
        setVerbIndex((i) => (i + 1) % VERBS.length)
        setPhase('typing')
        return
      }
      const t = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), DELETE_SPEED)
      return () => clearTimeout(t)
    }

    if (phase === 'typing') {
      if (displayed === target) {
        setPhase('pausing')
        return
      }
      const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), TYPE_SPEED)
      return () => clearTimeout(t)
    }
  }, [phase, displayed, verbIndex])

  function handleSuccess() {
    setMood('hyped')
  }

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-16 sm:py-24">
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
              className="inline-block min-w-[6ch] rounded-lg px-2 py-0.5"
              style={{ backgroundColor: '#6E54FF', color: '#FFF5F9' }}
            >
              {displayed}
              <span className="animate-pulse">|</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="font-heading font-semibold pt-3"
            style={{ fontSize: 'clamp(20px, 2.2vw, 28px)', color: '#334155', lineHeight: 1.5, maxWidth: '540px' }}
          >
            A 3D-printed AI robot with a voice, personality, and real-world abilities.
          </p>

          {/* CTA label */}
          {/* <div className="flex items-center justify-center pt-4 lg:justify-start">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 -rotate-5 top-1"
              style={{ background: 'linear-gradient(135deg, #6E54FF 0%, #FF66C4 100%)' }}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="font-body text-xs font-semibold tracking-wide text-white">
                Early access — spots filling fast
              </span>
            </div>
          </div> */}

          {/* Form */}
          <div className="w-full max-w-lg self-center lg:self-start">
            <WaitlistForm onSuccess={handleSuccess} />
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 lg:justify-start">
            <div className="flex -space-x-2">
              {[
                { src: '/avatars/dsouzajovian.jpg', alt: '@DsouzaJovian' },
                { src: '/avatars/pettiboy_com.jpg', alt: '@pettiboy_com' },
                { src: '/avatars/vitalikbuterin.jpg', alt: '@VitalikButerin' },
                { src: '/avatars/naval.jpg', alt: '@naval' },
                { src: '/avatars/balajis.jpg', alt: '@balajis' },
              ].map(({ src, alt }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={alt}
                  src={src}
                  alt={alt}
                  className="h-6 w-6 rounded-full border-2 border-dark object-cover sm:h-8 sm:w-8"
                />
              ))}
            </div>
            <p className="font-body text-xs font-medium text-dark/60 sm:text-sm">
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
