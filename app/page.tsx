import Image from 'next/image'
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

const PET_VALUES = [
  {
    icon: '👁️',
    title: 'Ambient Awareness',
    desc: 'Molty reacts so you don\'t have to constantly check. One glance at your desk tells you everything.',
    color: '#6E54FF',
  },
  {
    icon: '💥',
    title: 'Emotional Accountability',
    desc: 'When something goes wrong and Molty looks genuinely devastated, it actually hits different. You feel it.',
    color: '#FF66C4',
  },
  {
    icon: '🗣️',
    title: 'Voice-First',
    desc: 'No dashboards, no typing. Just say what you want. Molty handles the rest — swaps, timers, questions, bets.',
    color: '#5CE1E6',
  },
]

const FEATURES = [
  {
    icon: '🎭',
    title: 'Emotional Reactions',
    desc: 'Molty reads live market data and physically expresses real emotions — claws up when Bitcoin pumps, head down when it crashes.',
    color: '#FF66C4',
  },
  {
    icon: '🎙️',
    title: 'Voice DeFi',
    desc: 'Price checks, prediction market bets, and cross-chain swaps — all triggered by natural voice commands via the Raspberry Pi.',
    color: '#6E54FF',
  },
  {
    icon: '🦾',
    title: 'Physical Claws',
    desc: '3D-printed servo-driven claws that wave, grip, and gesture in sync with Molty\'s emotional state and voice responses.',
    color: '#5CE1E6',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Talk',
    desc: '"Molty, what\'s ETH at?" or "Bet 5 USDC on ETH going up."',
    icon: '🗣️',
  },
  {
    num: '02',
    title: 'Think',
    desc: 'Emotional AI processes market data, your command, and Molty\'s current mood state.',
    icon: '🧠',
  },
  {
    num: '03',
    title: 'Act',
    desc: 'Claws move. Voice responds. DeFi executes. Molty reacts with its whole tiny body.',
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
          <p className="mt-3 font-body text-base text-bg/55">
            Not an app. Not a dashboard. A presence that reacts to your world and talks back.
          </p>
        </div>

        {/* Why a digital pet */}
        <div className="mx-auto grid gap-6 px-6 max-w-4xl sm:grid-cols-3">
          {PET_VALUES.map((v) => (
            <div key={v.title} className="flex flex-col gap-3">
              <span
                className="text-3xl w-fit rounded-xl p-2"
                style={{ backgroundColor: v.color + '20' }}
              >
                {v.icon}
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
              More than a toy.
            </h2>
            <p className="mt-3 font-body text-lg text-dark/60">
              A desk companion that trades, reacts, and never shuts up about crypto.
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
                  className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dark text-3xl shadow-chunky-sm"
                  style={{ backgroundColor: f.color }}
                >
                  {f.icon}
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
            <p className="mt-3 font-body text-lg text-bg/50">
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
          <p className="mt-4 mb-8 font-body text-lg text-dark/60">
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
