import Image from 'next/image'
import Script from 'next/script'
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Cpu,
  Github,
  Move,
  PawPrint,
  Play,
  Radio,
  Route,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react'

const BUILD_POST =
  'https://x.com/DsouzaJovian/status/2077026876728676777?s=20'
const PROTOTYPE_POST =
  'https://x.com/DsouzaJovian/status/2078107900359356547?s=20'
const CREATOR_PROFILE = 'https://x.com/DsouzaJovian'

const values = [
  {
    icon: PawPrint,
    title: 'Presence, not another screen',
    body: 'A pet can notice, approach, wait, and share a room. Intelligence becomes something you live alongside—not another tab you open.',
  },
  {
    icon: Radio,
    title: 'A natural interface',
    body: 'Voice, movement, touch, and routine give people a familiar way to interact with an agent without learning a new product.',
  },
  {
    icon: BookOpen,
    title: 'Robotics in public',
    body: 'Every stumble becomes a useful lesson: motion policies, sensors, planning, memory, safety, and the reality of embodied AI.',
  },
  {
    icon: Users,
    title: 'A bridge to physical agents',
    body: 'Molty can turn abstract agent infrastructure into a character people understand—and a reference build other makers can extend.',
  },
]

const roadmap = [
  {
    phase: '01 / BODY',
    title: 'Move with confidence',
    copy: 'Stable walking, responsive gait control, better proprioception, obstacle sensing, and safer recovery.',
    state: 'Building now',
    icon: Move,
  },
  {
    phase: '02 / MIND',
    title: 'Think across time',
    copy: 'Planning, memory, voice, curiosity, and reflection—grounded in what Molty can actually sense and do.',
    state: 'Next',
    icon: BrainCircuit,
  },
  {
    phase: '03 / LIFE',
    title: 'Become a companion',
    copy: 'Learn household routines, develop useful behaviors, coordinate with other agents, and grow through long-term interaction.',
    state: 'North star',
    icon: Sparkles,
  },
]

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="site-header">
        <div className="site-shell flex h-16 items-center justify-between">
          <a
            href="#top"
            className="focus-ring flex min-h-11 items-center gap-2 rounded-lg"
            aria-label="Molty home"
          >
            <Image
              src="/molty-logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-lg"
            />
            <span className="font-mono text-sm font-semibold tracking-[0.12em]">
              MOLTY.PET
            </span>
          </a>

          <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
            <a className="nav-link focus-ring" href="#origin">
              Origin
            </a>
            <a className="nav-link focus-ring" href="#two-minds">
              Two minds
            </a>
            <a className="nav-link focus-ring" href="#why-a-pet">
              Why a pet
            </a>
            <a className="nav-link focus-ring" href="#roadmap">
              Roadmap
            </a>
          </nav>

          <a
            href={BUILD_POST}
            target="_blank"
            rel="noreferrer"
            className="button button-secondary"
          >
            Follow the build
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" className="hero-section ambient-grid scroll-mt-24">
          <div className="site-shell grid min-h-[calc(100svh-4rem)] items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24">
            <div className="relative z-10">
              <div className="eyebrow">
                <span className="status-dot" aria-hidden="true" />
                Raspberry Pi quadruped / active prototype
              </div>

              <h1 className="mt-6 max-w-[11ch] text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Fast reflexes.
                <span className="block text-primary">Slow thoughts.</span>
              </h1>

              <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                Molty is a robot dog learning to move, reason, and live alongside
                people
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#prototype" className="button button-primary">
                  <Play aria-hidden="true" className="size-4 fill-current" />
                  Watch Molty move
                </a>
                <a href="#two-minds" className="button button-secondary">
                  Explore the two minds
                  <ArrowDown aria-hidden="true" className="size-4" />
                </a>
              </div>

              <dl className="mt-12 grid max-w-xl grid-cols-3 border-y border-border/80 py-5">
                <div>
                  <dt className="metric-label">Body</dt>
                  <dd className="metric-value">Quadruped</dd>
                </div>
                <div className="border-x border-border/80 px-4 sm:px-6">
                  <dt className="metric-label">Brain</dt>
                  <dd className="metric-value">Raspberry Pi</dd>
                </div>
                <div className="pl-4 sm:pl-6">
                  <dt className="metric-label">Status</dt>
                  <dd className="metric-value text-primary">Learning</dd>
                </div>
              </dl>
            </div>

            <div className="relative z-10">
              <div className="hero-photo-frame">
                <Image
                  src="/molty-dog-front.jpg"
                  alt="Molty, a red four-legged robot dog prototype, standing on a workbench"
                  fill
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
                <div className="photo-label left-4 top-4">
                  <span className="status-dot" aria-hidden="true" />
                  LIVE PROTOTYPE
                </div>
                <div className="photo-label bottom-4 right-4">
                  <Cpu aria-hidden="true" className="size-4 text-primary" />
                  PI-POWERED
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden max-w-60 rounded-xl border border-border bg-card p-4 shadow-2xl lg:block">
                <p className="font-mono text-[0.65rem] tracking-[0.14em] text-primary">
                  CURRENT OBSESSION
                </p>
                <p className="mt-2 text-sm leading-6 text-card-foreground">
                  Teaching four legs to agree on where the ground is.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="origin" className="section scroll-mt-20">
          <div className="site-shell">
            <div className="section-heading">
              <p className="section-kicker">01 / ORIGIN STORY</p>
              <h2 className="section-title">Molty grew legs.</h2>
              <p className="section-copy">
                The first Molty was a friendly desk robot on two tracks. It could
                roam, listen, and talk—but it still felt like a device. Giving
                Molty four legs changed the question from “what can this robot
                do?” to “what kind of creature could this become?”
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="story-card">
                <div className="story-media bg-secondary">
                  <Image
                    src="/molty-hero.png"
                    alt="The original Molty concept, a small desk robot with two track wheels and a face display"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain p-8"
                  />
                </div>
                <div className="p-6 sm:p-7">
                  <p className="section-kicker">THEN / DESK ROBOT</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                    A companion that lived on the desk
                  </h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    Tracks, a screen, voice interaction, and a cheerful
                    personality. A useful starting point—but not yet the pet I
                    wanted to build.
                  </p>
                </div>
              </article>

              <article className="story-card story-card-current">
                <div className="story-media">
                  <Image
                    src="/molty-dog-side.jpg"
                    alt="The new Molty quadruped prototype showing its four red articulated legs and exposed Raspberry Pi"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-7">
                  <p className="section-kicker text-primary">NOW / ROBOT DOG</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                    A creature that can share your space
                  </h3>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    Four legs, an exposed nervous system, and a much bigger
                    ambition: explore what it takes for an intelligent machine to
                    feel present, responsive, and alive.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="two-minds" className="section section-alt scroll-mt-20">
          <div className="site-shell">
            <div className="section-heading">
              <p className="section-kicker">02 / THE ARCHITECTURE</p>
              <h2 className="section-title">One body. Two speeds of thought.</h2>
              <p className="section-copy">
                Animals do not ask their conscious mind to calculate every footstep.
                Molty follows the same idea: a fast loop keeps the body responsive
                while a slower loop works out what to do next.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="mind-card mind-card-fast">
                <div className="flex items-start justify-between gap-4">
                  <div className="icon-box">
                    <Move aria-hidden="true" className="size-6" />
                  </div>
                  <span className="state-badge">MILLISECONDS</span>
                </div>
                <p className="section-kicker mt-8 text-primary">FAST THINKING</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  The reflex loop
                </h3>
                <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
                  Neural motion policies turn live sensor data into motor commands.
                  This loop handles balance, gait, reactions, and recovery without
                  waiting for language.
                </p>
                <div className="flow-row" aria-label="Fast thinking flow">
                  <span>Sense</span>
                  <ArrowUpRight aria-hidden="true" />
                  <span>Policy</span>
                  <ArrowUpRight aria-hidden="true" />
                  <span>Move</span>
                </div>
              </article>

              <article className="mind-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="icon-box">
                    <BrainCircuit aria-hidden="true" className="size-6" />
                  </div>
                  <span className="state-badge">SECONDS → HOURS</span>
                </div>
                <p className="section-kicker mt-8">SLOW THINKING</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  The reasoning loop
                </h3>
                <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
                  An LLM observes context, plans actions, reflects on outcomes, and
                  builds memory. It gives the reflex loop direction without trying
                  to micromanage every joint.
                </p>
                <div className="flow-row" aria-label="Slow thinking flow">
                  <span>Observe</span>
                  <ArrowUpRight aria-hidden="true" />
                  <span>Plan</span>
                  <ArrowUpRight aria-hidden="true" />
                  <span>Remember</span>
                </div>
              </article>
            </div>

            <div className="learning-loop mt-5">
              <div className="icon-box shrink-0">
                <Route aria-hidden="true" className="size-6" />
              </div>
              <div>
                <p className="section-kicker text-primary">
                  THE LOOP BETWEEN THE LOOPS
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  Both systems learn continuously.
                </h3>
                <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
                  Fast learning improves how Molty moves. Slow learning improves
                  what Molty attempts, remembers, and values. The long-term
                  experiment is how those two forms of learning shape each other.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="prototype" className="section scroll-mt-20">
          <div className="site-shell">
            <div className="prototype-layout">
              <div className="prototype-copy">
                <p className="section-kicker">03 / FROM THE BENCH</p>
                <h2 className="section-title">The messy middle is the project.</h2>
                <p className="section-copy">
                  Molty wobbles. Servos disagree. Cables escape. That is exactly
                  why this is worth sharing: embodied intelligence is built through
                  thousands of small encounters with the real world.
                </p>
                <a
                  href={PROTOTYPE_POST}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-secondary mt-7"
                >
                  Open the live playlist on X
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              </div>

              <div className="video-frame prototype-feed">
                <div className="prototype-feed-bar">
                  <span className="flex items-center gap-2 font-mono text-xs tracking-[0.1em] text-foreground">
                    <span className="feed-status-dot" aria-hidden="true" />
                    LIVE FIELD NOTES
                  </span>
                  <span className="font-mono text-xs tracking-[0.08em] text-muted-foreground">
                    UPDATED ON X
                  </span>
                </div>
                <div className="x-embed-shell">
                  <blockquote
                    className="twitter-tweet x-embed-fallback"
                    data-theme="dark"
                    data-dnt="true"
                    data-conversation="none"
                  >
                    <p>Molty’s live prototype playlist is hosted on X.</p>
                    <a
                      href={PROTOTYPE_POST}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-secondary"
                    >
                      Watch on X
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </a>
                  </blockquote>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
                  <span className="font-mono text-xs tracking-[0.1em] text-muted-foreground">
                    PLAY THE LATEST CLIPS ABOVE
                  </span>
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Wrench aria-hidden="true" className="size-4 text-primary" />
                    Hardware in active development
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-a-pet" className="section section-alt scroll-mt-20">
          <div className="site-shell">
            <div className="section-heading">
              <p className="section-kicker">04 / WHY A PET?</p>
              <h2 className="section-title">
                The most human place for an agent is beside us.
              </h2>
              <p className="section-copy">
                A robotic dog is not only a locomotion problem. It is a way to
                explore trust, companionship, useful autonomy, and how intelligence
                changes when it has a body.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
              {values.map(({ icon: Icon, title, body }) => (
                <article key={title} className="value-card">
                  <div className="icon-box">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 max-w-lg leading-7 text-muted-foreground">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="roadmap" className="section section-alt scroll-mt-20">
          <div className="site-shell">
            <div className="section-heading">
              <p className="section-kicker">05 / LONG-TERM EXPERIMENT</p>
              <h2 className="section-title">Build the body. Grow the mind. Live together.</h2>
              <p className="section-copy">
                Molty is a long-running exploration of robotics—not a single demo.
                The roadmap stays simple enough to remember and difficult enough
                to spend years on.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {roadmap.map(({ phase, title, copy, state, icon: Icon }) => (
                <article key={phase} className="roadmap-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="icon-box">
                      <Icon aria-hidden="true" className="size-5" />
                    </div>
                    <span className="state-badge">{state}</span>
                  </div>
                  <p className="section-kicker mt-8">{phase}</p>
                  <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="site-shell">
            <div className="creator-card">
              <div>
                <p className="section-kicker text-primary">BUILDING IN PUBLIC</p>
                <blockquote className="mt-5 max-w-3xl text-balance text-2xl font-medium leading-snug tracking-tight sm:text-4xl">
                  “Side questing a sentient robot dog. Fast thinking = neural
                  networks controlling motion. Slow thinking = an LLM planning and
                  reasoning. Both learn continuously. Let’s see where this goes.”
                </blockquote>
              </div>

              <div className="mt-10 flex flex-col justify-between gap-6 border-t border-border pt-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <Image
                    src="/avatars/dsouzajovian.jpg"
                    alt="Jovian Dsouza"
                    width={48}
                    height={48}
                    className="rounded-full border border-border"
                  />
                  <div>
                    <p className="font-semibold">Jovian Dsouza</p>
                    <p className="text-sm text-muted-foreground">
                      Creator of Molty · Robotics explorer
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={BUILD_POST}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-primary"
                  >
                    Read the post
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                  <a
                    href="https://github.com/DsouzaJovian"
                    target="_blank"
                    rel="noreferrer"
                    className="button button-secondary"
                  >
                    <Github aria-hidden="true" className="size-4" />
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="site-shell flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Image
                src="/molty-logo.png"
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-lg"
              />
              <span className="font-mono text-sm font-semibold tracking-[0.12em]">
                MOLTY.PET
              </span>
            </div>
            <p className="mt-4 text-muted-foreground">
              A sentient robot dog. Let’s see where this goes.
            </p>
          </div>
          <div className="flex gap-5 text-sm">
            <a
              className="footer-link focus-ring"
              href={CREATOR_PROFILE}
              target="_blank"
              rel="noreferrer"
            >
              X / Twitter
            </a>
            <a
              className="footer-link focus-ring"
              href="https://github.com/DsouzaJovian"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a className="footer-link focus-ring" href="#top">
              Back to top
            </a>
          </div>
        </div>
      </footer>

      <Script
        id="x-widgets"
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
      />
    </>
  )
}
