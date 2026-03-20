import Image from 'next/image'
import { Mic, Sparkles, Zap, PawPrint, type LucideIcon } from 'lucide-react'
import HeroSection from './components/HeroSection'
import MoltyFace from './components/MoltyFace'
import MoodShowcase from './components/MoodShowcase'
import WaitlistForm from './components/WaitlistForm'

const FEATURES: Array<{ Icon: LucideIcon; title: string; desc: string; color: string; span?: string }> = [
  {
    Icon: Zap,
    title: 'Keeps You Going',
    desc: 'Molty reacts to your work in real time. Celebrates progress, nudges you when you stall, and makes boring tasks feel less empty.',
    color: '#FF66C4',
    span: 'sm:col-span-2',
  },
  {
    Icon: Mic,
    title: 'Just Say It',
    desc: 'No apps. No typing. Set reminders, ask questions, run tasks. Molty handles it instantly by voice.',
    color: '#6E54FF',
  },
  {
    Icon: Sparkles,
    title: 'Feels Alive',
    desc: 'Expressions, voice, movement. Molty responds, adapts, and feels like something that\'s actually there with you.',
    color: '#5CE1E6',
  },
]

const STEPS: Array<{ num: string; title: string; desc: string; Icon: LucideIcon; color: string }> = [
  {
    num: '01',
    title: 'Talk',
    desc: '"Molty, remind me in 20 minutes." or "What\'s on my list?" Just say it.',
    Icon: Mic,
    color: '#FF66C4',
  },
  {
    num: '02',
    title: 'Think (OpenClaw)',
    desc: 'OpenClaw handles execution: tasks, automations, and real-world actions.',
    Icon: PawPrint,
    color: '#6E54FF',
  },
  {
    num: '03',
    title: 'React',
    desc: 'Claws move. Voice responds. Molty reacts with its whole tiny body.',
    Icon: Zap,
    color: '#5CE1E6',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b-3 border-dark bg-bg/95 backdrop-blur-sm" style={{ borderBottomWidth: 3 }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div
              className="rounded-full p-[2.5px] shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6E54FF 0%, #FF66C4 100%)',
                boxShadow: '0 2px 14px rgba(110,84,255,0.40)',
              }}
            >
              <Image
                src="/logo-rounded.png"
                alt="Molty logo"
                width={42}
                height={42}
                className="rounded-full block"
                priority
              />
            </div>
            <span className="font-heading text-2xl font-bold tracking-wide text-dark leading-none">
              molty<span style={{ color: '#6E54FF' }}>.pet</span>
            </span>
          </a>
          <a
            href="#waitlist"
            className="rounded-xl border-3 border-dark bg-accent px-5 py-2 font-heading text-base font-semibold text-white shadow-chunky-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-accent/90"
            style={{ borderWidth: 3 }}
          >
            Join Waitlist 🚀
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <HeroSection />

      {/* ── The Problem ── */}
      <section
        className="noise-bg scanlines relative border-t-3 border-dark overflow-hidden"
        style={{ borderTopWidth: 3, backgroundColor: '#1A1528' }}
      >
        {/* Decorative grid dots */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #FFF5F9 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            {/* Oversized retro label */}
            <p
              className="font-retro text-sm tracking-[0.3em] uppercase mb-6"
              style={{ color: '#FF66C4' }}
            >
              The problem
            </p>

            <h2 className="font-heading text-4xl font-bold text-bg sm:text-5xl lg:text-6xl leading-tight">
              Your desk is quiet.{' '}
              <span
                className="relative inline-block"
              >
                <span className="font-retro" style={{ color: '#B0C4DE' }}>
                  Too quiet.
                </span>
                {/* Underline scribble */}
                <span
                  className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #FF66C4, #6E54FF)',
                    opacity: 0.6,
                  }}
                />
              </span>
            </h2>

            <p
              className="mx-auto mt-6 font-body text-lg sm:text-xl"
              style={{ color: 'rgb(160, 150, 185)', maxWidth: 580, lineHeight: 1.8 }}
            >
              No reactions. No feedback. Just you, your screen, and the hum of
              silence. The grind doesn&apos;t care how you feel.
            </p>

            {/* Emotional stat blocks */}
            <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4">
              {[
                { stat: '8hrs', label: 'avg. alone at desk', color: '#B0C4DE' },
                { stat: '73%', label: 'feel isolated WFH', color: '#FF66C4' },
                { stat: '0', label: 'things that react', color: '#6E54FF' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span
                    className="font-heading text-3xl font-bold sm:text-4xl"
                    style={{ color: s.color }}
                  >
                    {s.stat}
                  </span>
                  <span
                    className="font-body text-xs sm:text-sm"
                    style={{ color: 'rgb(130, 120, 160)' }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <p
              className="mx-auto mt-12 font-retro text-lg tracking-wider sm:text-xl"
              style={{ color: 'rgba(255,245,249,0.20)' }}
            >
              HUMANS WEREN&apos;T BUILT TO WORK LIKE THIS.
            </p>
          </div>
        </div>
      </section>

      {/* ── Gradient Divider ── */}
      <div
        className="h-24 sm:h-32"
        style={{
          background: 'linear-gradient(to bottom, #1A1528, #FFF5F9)',
        }}
      />

      {/* ── Meet Molty / Features — Bento Grid ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p
              className="font-retro text-sm tracking-[0.3em] uppercase mb-4"
              style={{ color: '#6E54FF' }}
            >
              Meet your companion
            </p>
            <h2 className="font-heading text-4xl font-bold text-dark sm:text-5xl lg:text-6xl">
              Meet{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #6E54FF 0%, #FF66C4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Molty
              </span>
              .
            </h2>
            <p className="mx-auto mt-4 font-body text-lg sm:text-xl" style={{ color: 'rgb(100, 116, 139)', maxWidth: 640, lineHeight: 1.7 }}>
              A desk companion that reacts, motivates, and actually helps you get things done.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`group relative overflow-hidden rounded-2xl border-3 border-dark p-7 shadow-chunky transition-all duration-300 hover:-translate-y-1 hover:shadow-chunky-lg ${f.span ?? ''}`}
                style={{
                  borderWidth: 3,
                  backgroundColor: f.color + '12',
                }}
              >
                {/* Corner accent */}
                <div
                  className="absolute -top-12 -right-12 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
                  style={{ backgroundColor: f.color }}
                />

                <div className="relative">
                  <div
                    className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dark shadow-chunky-sm transition-transform duration-300 group-hover:rotate-6"
                    style={{ backgroundColor: f.color }}
                  >
                    <f.Icon size={28} strokeWidth={2.5} color="white" />
                  </div>
                  <h3 className="mb-2 font-heading text-xl font-bold text-dark sm:text-2xl">
                    {f.title}
                  </h3>
                  <p className="font-body text-base leading-relaxed text-dark/70">
                    {f.desc}
                  </p>
                </div>

                {/* Bottom decorative bar */}
                <div
                  className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: f.color }}
                />
              </div>
            ))}
          </div>

          <p className="mx-auto mt-12 text-center font-retro text-lg tracking-wider sm:text-xl" style={{ color: '#FF66C4' }}>
            NOT JUST AN ASSISTANT — ITS YOUR FAVORITE DESK PET.
          </p>
        </div>
      </section>

      {/* ── Mood Showcase ── */}
      <section
        className="relative overflow-hidden border-y-3 border-dark px-6 py-20"
        style={{ backgroundColor: '#F8EEFF', borderTopWidth: 3, borderBottomWidth: 3 }}
      >
        {/* Decorative background shapes */}
        <div
          className="pointer-events-none absolute top-10 left-10 h-40 w-40 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: '#6E54FF' }}
        />
        <div
          className="pointer-events-none absolute bottom-10 right-10 h-32 w-32 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: '#FF66C4' }}
        />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p
              className="font-retro text-sm tracking-[0.3em] uppercase mb-4"
              style={{ color: '#6E54FF' }}
            >
              Emotional range
            </p>
            <h2 className="font-heading text-4xl font-bold text-dark sm:text-5xl">
              Every mood.{' '}
              <span style={{ color: '#FF66C4' }}>Every moment.</span>
            </h2>
            <p className="mx-auto mt-4 font-body text-lg" style={{ color: 'rgb(100, 116, 139)', maxWidth: 500, lineHeight: 1.7 }}>
              Molty doesn&apos;t fake it. Each expression maps to real context. Your wins, your losses, your &ldquo;what just happened&rdquo; moments.
            </p>
          </div>

          <MoodShowcase />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        className="noise-bg scanlines relative overflow-hidden"
        style={{ backgroundColor: '#1A1528' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #FFF5F9 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p
                className="font-retro text-sm tracking-[0.3em] uppercase mb-4"
                style={{ color: '#5CE1E6' }}
              >
                How it works
              </p>
              <h2 className="font-heading text-4xl font-bold text-bg sm:text-5xl lg:text-6xl">
                Three steps.{' '}
                <span style={{ color: '#5CE1E6' }}>Zero friction.</span>
              </h2>
              <p className="mx-auto mt-4 font-body text-lg" style={{ color: 'rgb(160, 150, 185)', maxWidth: 500, lineHeight: 1.7 }}>
                From voice to vibe in under a second.
              </p>
            </div>

            {/* Vertical timeline on mobile, horizontal on desktop */}
            <div className="relative mx-auto max-w-4xl">
              {/* Desktop connector line */}
              <div
                className="absolute top-[52px] left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] hidden h-[3px] sm:block"
                style={{
                  background: 'repeating-linear-gradient(90deg, #6E54FF 0, #6E54FF 8px, transparent 8px, transparent 16px)',
                  opacity: 0.4,
                }}
              />

              <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
                {STEPS.map((step, i) => (
                  <div key={step.num} className="relative flex flex-col items-center text-center">
                    {/* Step icon */}
                    <div
                      className="relative mb-6 flex h-[104px] w-[104px] items-center justify-center rounded-2xl border-3 shadow-chunky transition-transform duration-300 hover:rotate-3 hover:scale-105"
                      style={{
                        backgroundColor: step.color + '20',
                        borderWidth: 3,
                        borderColor: step.color,
                      }}
                    >
                      <step.Icon size={48} strokeWidth={1.75} color={step.color} />
                      {/* Number badge */}
                      <span
                        className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border-2 font-retro text-base"
                        style={{
                          backgroundColor: step.color,
                          borderColor: '#1A1528',
                          color: '#1A1528',
                        }}
                      >
                        {step.num.replace('0', '')}
                      </span>
                    </div>

                    <h3 className="mb-3 font-heading text-2xl font-bold text-bg">
                      {step.title}
                    </h3>
                    <p className="mx-auto max-w-xs font-body text-sm leading-relaxed" style={{ color: 'rgb(160, 150, 185)' }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA / Waitlist ── */}
      <footer id="waitlist" className="relative overflow-hidden px-6 py-24 sm:py-28">
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: '#6E54FF' }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 left-1/4 h-48 w-48 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: '#FF66C4' }}
        />

        <div className="relative mx-auto max-w-2xl text-center">
          {/* Molty face */}
          <div className="mb-10 flex justify-center">
            <div className="animate-float">
              <MoltyFace mood="celebrating" size="md" animateClaws />
            </div>
          </div>

          <p
            className="font-retro text-sm tracking-[0.3em] uppercase mb-4"
            style={{ color: '#6E54FF' }}
          >
            Limited batches
          </p>

          <h2 className="font-heading text-4xl font-bold text-dark sm:text-5xl lg:text-6xl">
            Be first in line.
          </h2>
          <p className="mx-auto mt-4 mb-10 font-body text-lg" style={{ color: 'rgb(100, 116, 139)', maxWidth: 540, lineHeight: 1.7 }}>
            Molty ships in limited batches. Get on the waitlist and we&apos;ll let
            you know the moment yours is ready.
          </p>

          <div
            className="rounded-2xl border-3 border-dark p-6 shadow-chunky sm:p-8"
            style={{ backgroundColor: '#6E54FF12', borderWidth: 3 }}
          >
            <WaitlistForm buttonText="Notify Me 🔔" />
          </div>

          <p className="mt-6 font-body text-sm text-dark/40">
            No spam. Just Molty news, shipping updates, and the occasional crypto
            meme.
          </p>

          {/* Bottom bar */}
          <div className="mt-20 border-t-2 border-dark/10 pt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className="rounded-full p-[2px] shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #6E54FF 0%, #FF66C4 100%)',
                  boxShadow: '0 1px 8px rgba(110,84,255,0.35)',
                }}
              >
                <Image
                  src="/logo-rounded.png"
                  alt="Molty logo"
                  width={28}
                  height={28}
                  className="rounded-full block"
                />
              </div>
              <p className="font-heading text-xl font-bold text-dark">
                molty<span style={{ color: '#6E54FF' }}>.pet</span>
              </p>
            </div>
            <p className="font-retro text-base tracking-wider text-dark/40">
              YOUR FAVORITE DESK PET
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
