import Image from 'next/image'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Cpu,
  Github,
  Heart,
  Move,
  PackageOpen,
  PawPrint,
  Play,
  Radio,
  Route,
  Sparkles,
  Wrench,
} from 'lucide-react'

const PRODUCT_PROFILE = 'https://x.com/moltypet'
const CREATOR_PROFILE = 'https://x.com/DsouzaJovian'
const PROTOTYPE_POST =
  'https://x.com/DsouzaJovian/status/2078107900359356547?s=20'
const SOURCE_REPOSITORY = 'https://github.com/Jovian-Dsouza/molty.pet'
const PROTOTYPE_VIDEO = '/molty-prototype-demo.mp4'

const buildFeatures = [
  {
    icon: PackageOpen,
    title: 'Affordable parts',
    body: 'Built around a Raspberry Pi, common servos, printable components, and an actively evolving bill of materials.',
  },
  {
    icon: Wrench,
    title: 'Open and repairable',
    body: 'Replace parts, modify behaviors, and make your Molty different from every other one.',
  },
  {
    icon: Radio,
    title: 'Built in public',
    body: 'The BOM, failed gaits, fixes, and working demos are shared as they happen.',
  },
]

const roadmap = [
  {
    phase: '01 / BUILD',
    title: 'A kit people can assemble',
    copy: 'Affordable parts, printable components, documented assembly, stable walking, and repairable hardware.',
    state: 'Building now',
    icon: Wrench,
  },
  {
    phase: '02 / BOND',
    title: 'A companion with personality',
    copy: 'Voice, memory, routines, and expressive movement grounded in what Molty can sense and do.',
    state: 'Next',
    icon: Heart,
  },
  {
    phase: '03 / CONNECT',
    title: 'A physical body for agents',
    copy: 'Turn meaningful agent events into movement, sound, attention, and shared rituals.',
    state: 'Early experiments',
    icon: Bot,
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
          >
            <Image
              src="/molty-logo.png"
              alt=""
              width={36}
              height={36}
              className="size-9"
            />
            <span className="font-mono text-sm font-semibold tracking-[0.12em]">
              MOLTY.PET
            </span>
          </a>

          <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
            <a className="nav-link focus-ring" href="#build">
              Build
            </a>
            <a className="nav-link focus-ring" href="#meet-molty">
              Meet Molty
            </a>
            <a className="nav-link focus-ring" href="#connect">
              Connect an agent
            </a>
            <a className="nav-link focus-ring" href="#progress">
              Progress
            </a>
          </nav>

          <a
            href={PRODUCT_PROFILE}
            target="_blank"
            rel="noreferrer"
            className="button button-secondary"
          >
            Follow @moltypet
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section id="top" className="hero-section ambient-grid scroll-mt-24">
          <div className="site-shell grid min-h-[calc(100svh-4rem)] items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-24">
            <div className="relative z-10">
              <div className="eyebrow">
                <span className="status-dot" aria-hidden="true" />
                Open-source robot pet · active prototype
              </div>

              <h1 className="mt-6 max-w-[15ch] text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-[4rem]">
                Build a robot pet.
                <span className="block text-primary">Give your AI a body.</span>
              </h1>

              <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                Molty is a four-legged robot pet you assemble yourself. It is
                being built to walk, talk, remember, and react when your AI
                agents get something done.
              </p>

              <p className="status-line">
                <strong>Walking now.</strong> Voice, memory, and agent
                connections are next.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={PRODUCT_PROFILE}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-primary"
                >
                  Follow @moltypet
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
                <a href="#proof" className="button button-secondary">
                  <Play aria-hidden="true" className="size-4 fill-current" />
                  Watch Molty move
                </a>
              </div>

              <dl className="mt-10 grid max-w-xl grid-cols-3 border-y border-border/80 py-5">
                <div>
                  <dt className="metric-label">Prototype cost</dt>
                  <dd className="metric-value">≈$60</dd>
                </div>
                <div className="border-x border-border/80 px-4 sm:px-6">
                  <dt className="metric-label">Computer</dt>
                  <dd className="metric-value">Raspberry Pi</dd>
                </div>
                <div className="pl-4 sm:pl-6">
                  <dt className="metric-label">Status</dt>
                  <dd className="metric-value text-primary">Walking</dd>
                </div>
              </dl>
            </div>

            <div className="relative z-10">
              <div className="hero-photo-frame">
                <Image
                  src="/molty-dog-front.jpg"
                  alt="Molty, a red four-legged robot pet prototype, standing on a workbench"
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 100vw"
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
                  OPEN BUILD IN PROGRESS
                </p>
                <p className="mt-2 text-sm leading-6 text-card-foreground">
                  Printable parts, common servos, and every wobble shared in
                  public.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="section section-alt scroll-mt-20">
          <div className="site-shell proof-layout">
            <div>
              <p className="section-kicker">REAL HARDWARE / JULY 2026</p>
              <h2 className="section-title">
                This is a working prototype—not a render.
              </h2>
              <p className="section-copy">
                Molty is being built in public from printable parts, common
                servos, and a Raspberry Pi. Every stable step, failed gait,
                loose cable, and working integration becomes part of the open
                build.
              </p>
              <a
                href={PROTOTYPE_POST}
                target="_blank"
                rel="noreferrer"
                className="button button-secondary mt-7"
              >
                Watch the latest 48-second demo
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>

            <figure className="video-frame">
              <video
                id="demo"
                controls
                playsInline
                preload="metadata"
                poster="/molty-dog-front.jpg"
                className="prototype-video"
                aria-label="Molty walking, waving, and dancing in the latest prototype demo"
              >
                <source src={PROTOTYPE_VIDEO} type="video/mp4" />
                Your browser does not support embedded video.{' '}
                <a href={PROTOTYPE_POST}>Watch the prototype demo on X.</a>
              </video>
              <figcaption className="media-caption">
                Real prototype footage: walking, waving, and dancing on the
                workbench.
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="build" className="section scroll-mt-20">
          <div className="site-shell">
            <div className="section-heading">
              <p className="section-kicker">01 / BUILD</p>
              <h2 className="section-title">A robot pet you make yourself.</h2>
              <p className="section-copy">
                Print the parts, connect the servos, and bring Molty to life.
                Because you build the body yourself, the relationship starts
                before Molty takes its first step.
              </p>
            </div>

            <div className="feature-grid">
              {buildFeatures.map(({ icon: Icon, title, body }) => (
                <article key={title} className="feature-card">
                  <div className="icon-box">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>

            <a href="#progress" className="button button-secondary mt-7">
              See the prototype parts
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </section>

        <section id="meet-molty" className="section section-alt scroll-mt-20">
          <div className="site-shell">
            <div className="section-heading">
              <p className="section-kicker">02 / BOND</p>
              <h2 className="section-title">More companion than voice assistant.</h2>
              <div className="section-copy space-y-4">
                <p>
                  Molty is being designed to greet you, learn routines,
                  remember interactions, and express what it is doing through
                  movement and sound.
                </p>
                <p>
                  No notification dashboard. No face trapped behind another
                  screen. Just a pet that shares your desk.
                </p>
              </div>
            </div>

            <div className="status-grid">
              <article className="mind-card mind-card-fast">
                <span className="state-badge">TODAY</span>
                <div className="icon-box mt-8">
                  <Move aria-hidden="true" className="size-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                  Walking and motion control
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  The current prototype walks, waves, and dances with
                  Raspberry Pi-powered motion control.
                </p>
              </article>

              <article className="mind-card">
                <span className="state-badge">NEXT</span>
                <div className="icon-box mt-8">
                  <Sparkles aria-hidden="true" className="size-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                  Voice, memory, and expressive routines
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  These companion behaviors are the next build stage, not
                  capabilities of today&apos;s walking prototype.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="connect" className="section scroll-mt-20">
          <div className="site-shell connect-layout">
            <div className="section-heading">
              <p className="section-kicker">03 / CONNECT</p>
              <h2 className="section-title">Give your cloud agent a face and body.</h2>
              <p className="section-copy">
                Connect Molty to the agents already working for you. When an
                agent finishes a task, finds an opportunity, or needs
                attention, Molty can react in the room.
              </p>
              <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
                Agent connections are in early experiments. The reaction below
                is a concrete behavior the project is building toward.
              </p>
              <a
                href="#agent-reaction"
                className="button button-secondary mt-7"
              >
                See the agent reaction
                <ArrowDown aria-hidden="true" className="size-4" />
              </a>
            </div>

            <div id="agent-reaction" className="reaction-card scroll-mt-20">
              <div className="flex items-center justify-between gap-4">
                <div className="icon-box">
                  <Bot aria-hidden="true" className="size-6" />
                </div>
                <span className="state-badge">PLANNED REACTION</span>
              </div>
              <p className="section-kicker mt-8 text-primary">CONCRETE EXAMPLE</p>
              <p className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Trading agent makes a profit
                <ArrowDown aria-hidden="true" className="my-4 size-7 text-primary" />
                Molty celebrates.
              </p>
            </div>
          </div>
        </section>

        <section id="progress" className="section section-alt scroll-mt-20">
          <div className="site-shell prototype-layout">
            <div className="prototype-copy">
              <p className="section-kicker">LIVE PROTOTYPE PROGRESS</p>
              <h2 className="section-title">The messy middle is the project.</h2>
              <p className="section-copy">
                Molty wobbles. Servos disagree. Cables escape. Every failure is
                public—and every fix moves the pet closer to becoming something
                people can build and live with.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={PROTOTYPE_POST}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-secondary"
                >
                  Watch the latest build
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
                <a
                  href={PRODUCT_PROFILE}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-secondary"
                >
                  Follow @moltypet
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              </div>
            </div>

            <figure className="progress-photo">
              <Image
                src="/molty-dog-side.jpg"
                alt="Molty's red articulated legs, servos, wiring, and Raspberry Pi visible on a workbench"
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
              <div className="photo-label left-4 top-4">
                <span className="status-dot" aria-hidden="true" />
                BUILDING IN PUBLIC
              </div>
              <figcaption className="sr-only">
                Molty&apos;s printable body, common servos, exposed wiring, and
                Raspberry Pi during active development.
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="architecture" className="section scroll-mt-20">
          <div className="site-shell">
            <div className="section-heading">
              <p className="section-kicker">HOW MOLTY WORKS</p>
              <h2 className="section-title">Fast reflexes. Slow thoughts.</h2>
              <p className="section-copy">
                Molty does not wait for an AI model before moving. Balance and
                motion run through a fast local reflex loop. Planning, memory,
                and agent decisions happen through a slower reasoning loop.
              </p>
              <p className="section-copy">
                That keeps the body responsive while the mind is still
                thinking.
              </p>
              <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
                Local motion control is working now, while gait refinement and
                recovery remain in development. The full agent loop is planned.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="mind-card mind-card-fast">
                <div className="flex items-start justify-between gap-4">
                  <div className="icon-box">
                    <Move aria-hidden="true" className="size-6" />
                  </div>
                  <span className="state-badge">IN DEVELOPMENT</span>
                </div>
                <p className="section-kicker mt-8 text-primary">FAST LOOP</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  The reflex loop
                </h3>
                <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
                  Live sensor data becomes motor commands for gait, balance,
                  recovery, and responsive movement.
                </p>
                <div className="flow-row" aria-label="Reflex loop flow">
                  <span>Sense</span>
                  <ArrowRight aria-hidden="true" />
                  <span>Balance</span>
                  <ArrowRight aria-hidden="true" />
                  <span>Move</span>
                </div>
              </article>

              <article className="mind-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="icon-box">
                    <BrainCircuit aria-hidden="true" className="size-6" />
                  </div>
                  <span className="state-badge">PLANNED</span>
                </div>
                <p className="section-kicker mt-8">SLOW LOOP</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  The agent loop
                </h3>
                <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
                  AI models interpret context, plan actions, form memories, and
                  decide what Molty should do next.
                </p>
                <div className="flow-row" aria-label="Agent loop flow">
                  <span>Understand</span>
                  <ArrowRight aria-hidden="true" />
                  <span>Plan</span>
                  <ArrowRight aria-hidden="true" />
                  <span>Remember</span>
                </div>
              </article>
            </div>

            <div className="learning-loop mt-5">
              <div className="icon-box shrink-0">
                <Route aria-hidden="true" className="size-6" />
              </div>
              <div>
                <p className="section-kicker text-primary">LONG-TERM GOAL</p>
                <h3 className="mt-2 text-xl font-semibold">
                  The long-term goal is for both pathways to improve over time.
                </h3>
                <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
                  Better movement locally, and better decisions through memory
                  and planning.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="section section-alt scroll-mt-20">
          <div className="site-shell">
            <div className="section-heading">
              <p className="section-kicker">PRODUCT ROADMAP</p>
              <h2 className="section-title">
                Build the body. Grow the bond. Connect the agent.
              </h2>
              <p className="section-copy">
                Molty is a long-running robotics project, but the next steps are
                concrete: make the kit reproducible, make the pet expressive,
                and make agent connections useful.
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

        <section id="builder-updates" className="section scroll-mt-20">
          <div className="site-shell">
            <div className="signup-card">
              <div className="icon-box mx-auto">
                <PawPrint aria-hidden="true" className="size-6" />
              </div>
              <p className="section-kicker mt-6 text-primary">BUILD UPDATES</p>
              <h2 className="section-title mx-auto">Want to build the first Molty?</h2>
              <p className="section-copy mx-auto">
                Get the BOM, CAD files, and important build updates as they
                become available.
              </p>
              <a
                href={PRODUCT_PROFILE}
                target="_blank"
                rel="noreferrer"
                className="button button-primary mt-7"
              >
                Follow @moltypet for build releases
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
              <p className="mt-4 text-sm text-muted-foreground">
                Useful updates only. No weekly newsletter.
              </p>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="site-shell">
            <div className="creator-card">
              <div>
                <p className="section-kicker text-primary">CREATOR OF MOLTY</p>
                <blockquote className="mt-5 max-w-4xl text-balance text-2xl font-medium leading-snug tracking-tight sm:text-4xl">
                  “I&apos;m building the robot pet I wanted on my desk: open,
                  expressive, repairable, and connected to the agents already
                  working for me.”
                </blockquote>
              </div>

              <div className="mt-10 flex flex-col justify-between gap-6 border-t border-border pt-6 sm:flex-row sm:items-center">
                <a
                  href={CREATOR_PROFILE}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring flex items-center gap-4 rounded-lg"
                >
                  <Image
                    src="/avatars/dsouzajovian.jpg"
                    alt=""
                    width={48}
                    height={48}
                    className="rounded-full border border-border"
                  />
                  <span>
                    <span className="block font-semibold">Jovian Dsouza</span>
                    <span className="block text-sm text-muted-foreground">
                      Creator of Molty
                    </span>
                  </span>
                </a>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={PRODUCT_PROFILE}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-secondary"
                  >
                    Meet Molty on X
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                  <a
                    href={PROTOTYPE_POST}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-secondary"
                  >
                    Follow the build
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                  <a
                    href={SOURCE_REPOSITORY}
                    target="_blank"
                    rel="noreferrer"
                    className="button button-secondary"
                  >
                    <Github aria-hidden="true" className="size-4" />
                    View the source
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="site-shell footer-layout">
          <div>
            <div className="flex items-center gap-2">
              <Image
                src="/molty-logo.png"
                alt=""
                width={36}
                height={36}
                className="size-9"
              />
              <span className="font-mono text-sm font-semibold tracking-[0.12em]">
                MOLTY.PET
              </span>
            </div>
            <p className="mt-4 max-w-xl text-muted-foreground">
              An open robot pet you build, bond with, and connect to your
              agents.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="footer-links">
            <a
              className="footer-link focus-ring"
              href={PRODUCT_PROFILE}
              target="_blank"
              rel="noreferrer"
            >
              Molty on X
            </a>
            <a
              className="footer-link focus-ring"
              href={CREATOR_PROFILE}
              target="_blank"
              rel="noreferrer"
            >
              Creator
            </a>
            <a
              className="footer-link focus-ring"
              href={SOURCE_REPOSITORY}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="footer-link focus-ring"
              href={PRODUCT_PROFILE}
              target="_blank"
              rel="noreferrer"
            >
              Build updates
            </a>
            <a className="footer-link focus-ring" href="#top">
              Back to top
            </a>
          </nav>
        </div>
      </footer>
    </>
  )
}
