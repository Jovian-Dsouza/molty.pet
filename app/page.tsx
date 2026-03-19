import Image from 'next/image'
import { Eye, Heart, Mic, Sparkles, Zap, type LucideIcon } from 'lucide-react'
import HeroSection from './components/HeroSection'
import MoltyFace, { type Mood } from './components/MoltyFace'
import WaitlistForm from './components/WaitlistForm'

const MOODS: Array<{ mood: Mood; label: string; emoji: string; bg: string; trigger: string }> = [
  { mood: 'hyped', label: 'hyped', emoji: '🔥', bg: '#FF66C4', trigger: 'Big win. Could be anything.' },
  { mood: 'heartbroken', label: 'heartbroken', emoji: '💔', bg: '#B0C4DE', trigger: 'That trade. That project. That day.' },
  { mood: 'celebrating', label: 'celebrating', emoji: '🎉', bg: '#5CE1E6', trigger: 'You asked it to — and it did.' },
  { mood: 'nervous', label: 'nervous', emoji: '😰', bg: '#FFB347', trigger: 'Something\'s about to happen.' },
  { mood: 'side-eye', label: 'side-eye', emoji: '👀', bg: '#C8B8FF', trigger: 'You know what you did.' },
]

const PET_VALUES: Array<{ Icon: LucideIcon; title: string; desc: string; color: string }> = [
  {
    Icon: Eye,
    title: 'Ambient Awareness',
    desc: 'Molty reacts so you don\'t have to constantly check. One glance at your desk tells you everything.',
    color: '#6E54FF',
  },
  {
    Icon: Heart,
    title: 'Emotional Accountability',
    desc: 'When something goes wrong and Molty looks genuinely devastated, it actually hits different. You feel it.',
    color: '#FF66C4',
  },
  {
    Icon: Mic,
    title: 'Voice-First',
    desc: 'No dashboards, no typing. Just say what you want. Molty handles the rest — timers, questions, check-ins.',
    color: '#5CE1E6',
  },
]

const FEATURES: Array<{ Icon: LucideIcon; title: string; desc: string; color: string }> = [
  {
    Icon: Zap,
    title: 'Keeps You Going',
    desc: 'Molty reacts to your work in real time. Celebrates progress, nudges you when you stall, and makes boring tasks feel less empty.',
    color: '#FF66C4',
  },
  {
    Icon: Mic,
    title: 'Just Say It',
    desc: 'No apps. No typing. Set reminders, ask questions, run tasks, or check in. Molty handles it instantly by voice.',
    color: '#6E54FF',
  },
  {
    Icon: Sparkles,
    title: 'Feels Alive',
    desc: 'Expressions, voice, movement. Molty isn\'t static. It responds, adapts, and feels like something that\'s actually there with you.',
    color: '#5CE1E6',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Talk',
    desc: '"Molty, remind me in 20 minutes." or "What\'s on my list?" Just say it.',
    icon: '🗣️',
  },
  {
    num: '02',
    title: 'Think',
    desc: 'Emotional AI processes your voice, your context, and Molty\'s current mood to respond.',
    icon: '🧠',
  },
  {
    num: '03',
    title: 'React',
    desc: 'Claws move. Voice responds. Molty reacts with its whole tiny body — instantly.',
    icon: '⚡',
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

      {/* ── Emotions Strip ── */}
      <section className="border-y-3 border-dark bg-dark py-16 overflow-hidden" style={{ borderTopWidth: 3, borderBottomWidth: 3 }}>
        {/* Header */}
        <div className="mx-auto mb-10 px-6 text-center max-w-xl">
          <h2 className="font-heading text-3xl font-bold text-bg sm:text-4xl">
            A desk pet that actually gives a damn.
          </h2>
          <p className="mx-auto mt-4 font-body" style={{ fontSize: 20, color: 'rgb(180, 192, 210)', maxWidth: 640, lineHeight: 1.7 }}>
            Not an app. Not a dashboard. A presence that reacts to your world and talks back.
          </p>
        </div>

        {/* Why a digital pet */}
        <div className="mx-auto grid gap-6 px-6 max-w-4xl sm:grid-cols-3">
          {PET_VALUES.map((v) => (
            <div key={v.title} className="flex flex-col gap-3">
              <span
                className="w-fit rounded-xl p-2.5"
                style={{ backgroundColor: v.color + '30' }}
              >
                <v.Icon size={26} strokeWidth={2} color={v.color} />
              </span>
              <h3 className="font-heading text-lg font-bold text-bg">
                {v.title}
              </h3>
              <p className="font-body text-sm leading-relaxed text-bg/55">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl font-bold text-dark sm:text-5xl">
              More than a toy
            </h2>
            <p className="mx-auto mt-4 font-body" style={{ fontSize: 20, color: 'rgb(100, 116, 139)', maxWidth: 640, lineHeight: 1.7 }}>
              Molty doesn&apos;t just sit on your desk. It reacts, motivates, and helps you move through your day.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border-3 border-dark p-6 shadow-chunky transition-transform hover:-translate-y-1 hover:shadow-chunky-lg"
                style={{
                  backgroundColor: f.color + '18',
                  borderWidth: 3,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dark shadow-chunky-sm"
                  style={{ backgroundColor: f.color }}
                >
                  <f.Icon size={28} strokeWidth={2.5} color="white" />
                </div>
                <h3 className="mb-2 font-heading text-xl font-bold text-dark">
                  {f.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-dark/70">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        className="border-y-3 border-dark px-6 py-20"
        style={{ backgroundColor: '#1A1528', borderTopWidth: 3, borderBottomWidth: 3 }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl font-bold text-bg sm:text-5xl">
              How it works.
            </h2>
            <p className="mx-auto mt-4 font-body" style={{ fontSize: 20, color: 'rgb(160, 150, 185)', maxWidth: 640, lineHeight: 1.7 }}>
              Three steps from voice to vibe.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute top-10 left-1/2 hidden h-0.5 w-full sm:block"
                    style={{ backgroundColor: '#6E54FF', opacity: 0.4 }}
                  />
                )}

                <div
                  className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-primary text-4xl shadow-chunky"
                  style={{ backgroundColor: '#6E54FF', borderWidth: 3 }}
                >
                  {step.icon}
                  <span
                    className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-dark font-retro text-sm"
                    style={{ backgroundColor: '#FF66C4', color: '#1A1528' }}
                  >
                    {step.num.replace('0', '')}
                  </span>
                </div>

                <h3 className="mb-2 font-heading text-2xl font-bold text-bg">
                  {step.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-bg/60 max-w-xs">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA / Waitlist ── */}
      <footer id="waitlist" className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          {/* Molty face */}
          <div className="mb-8 flex justify-center">
            <MoltyFace mood="celebrating" size="md" animateClaws />
          </div>

          <h2 className="font-heading text-4xl font-bold text-dark sm:text-5xl">
            Be first in line.
          </h2>
          <p className="mx-auto mt-4 mb-8 font-body" style={{ fontSize: 20, color: 'rgb(100, 116, 139)', maxWidth: 640, lineHeight: 1.7 }}>
            Molty ships in limited batches. Get on the waitlist and we&apos;ll let
            you know the moment yours is ready.
          </p>

          <div
            className="rounded-2xl border-3 border-dark p-6 shadow-chunky sm:p-8"
            style={{ backgroundColor: '#6E54FF18', borderWidth: 3 }}
          >
            <WaitlistForm buttonText="Notify Me 🔔" />
          </div>

          <p className="mt-6 font-body text-sm text-dark/40">
            No spam. Just Molty news, shipping updates, and the occasional crypto
            meme.
          </p>

          {/* Bottom bar */}
          <div className="mt-16 border-t-2 border-dark/10 pt-8 flex flex-col items-center gap-2">
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
              FEEL THE MARKET. OWN THE MOMENT.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
