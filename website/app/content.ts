import type { Catalog } from './lib/cart'

/* ---------- Commerce ---------- */

export const PRODUCT_ID = 'molty'
export const PRICE_USD = 150
export const ORDER_EMAIL = 'jovian@molty.pet'

export const CATALOG: Catalog = {
  [PRODUCT_ID]: { id: PRODUCT_ID, name: 'Molty (assembled)', priceUsd: PRICE_USD },
}

/* ---------- Links & media ---------- */

export const LINKS = {
  productX: 'https://x.com/moltypet',
  creatorX: 'https://x.com/DsouzaJovian',
  github: 'https://github.com/Jovian-Dsouza/molty.pet',
  hermes: 'https://hermes-agent.nousresearch.com',
  contact: `mailto:${ORDER_EMAIL}`,
} as const

export const NAV = [
  { href: '#day', label: 'A day with Molty' },
  { href: '#inside', label: 'Inside' },
  { href: '#social', label: 'Build log' },
  { href: '#play', label: 'Try it' },
] as const

/* ---------- Copy ---------- */

export const HERO = {
  title: 'A robot pet for your AI agent.',
  body: 'Molty sits on your desk and listens for “Hey Molty.” It hands the job to your Hermes agent in the cloud, then shows you how it’s going with its whole body.',
  cta: 'Pre-order',
  secondary: 'Follow the build',
} as const

export const STAGE = {
  label: 'A day with Molty',
  play: 'Play',
  pause: 'Pause',
  soundOn: 'Turn sound on',
  soundOff: 'Mute',
  you: 'You',
  molty: 'Molty',
  note: 'Simulation: Molty’s CAD model running the firmware’s motion files. Demo voices.',
  loading: 'Setting up the desk…',
} as const

export const SOCIAL = {
  title: 'Built in public.',
  follow: 'Follow the journey',
  /**
   * Build posts from x.com, oldest first. `reply` is the ID of the post @moltypet
   * replied with under it; it shows nested in the card. Fetched at build time.
   */
  posts: [{ id: '2077026876728676777' }, { id: '2078107900359356547' }],
  molty: { replied: 'replied on its own' },
  praise: {
    title: 'What people are saying',
    /** Post IDs from people talking about Molty. The row stays hidden while this is empty. */
    posts: [] as readonly string[],
  },
  milestone: {
    image: '/social/hackmoney-molty.jpg',
    imageAlt: 'Molty’s first body: a red 3D-printed robot on tank treads, with a face on its screen and one claw raised.',
    event: 'ETHGlobal HackMoney 2026',
    result: '2nd place, Yellow track',
    body: 'Molty’s first body, a wheeled desk robot with claws, won a prize for handling crypto bets and swaps by voice.',
    href: 'https://ethglobal.com/showcase/molty-s23q7',
    cta: 'See the project',
  },
} as const

export const FLOW = {
  title: 'From your voice to its legs.',
  caption: 'Your words leave the robot as text. The answer comes back as a named, tested move.',
  agents: ['Hermes', 'OpenClaw', 'Claude Code', 'Any agent'],
  alt: 'Diagram. You speak to Molty. On the robot, a local voice model hears “Hey Molty” and turns speech into text. The text goes to a cloud agent that holds your memory: Hermes, OpenClaw, Claude Code, or any other. The agent replies with a named move, the robot picks it and drives its servos and face, and the memory grows with every task.',
} as const

export const PLAY = {
  title: 'Take Molty for a walk.',
  body: 'The same model, now you drive. Push the ball into the goal, or pick a trick and watch the servo angles change.',
  hint: 'Click the arena, then WASD or arrow keys to drive. Click Molty to poke it.',
  footnote: 'Geometry from the open Sesame robot CAD (Apache-2.0). Motion is keyframe playback, not physics: the real one fits on your desk.',
} as const

export const AUDIENCES = {
  title: 'Pick your way in.',
  items: [
    {
      title: 'You work with agents',
      body: 'You already hand work to an AI agent. Molty lets you do it out loud and tells you the moment it’s done.',
      cta: { label: 'Pre-order Molty', href: '#buy', external: false },
    },
    {
      title: 'You like to build',
      body: 'The firmware is public. Print the body, wire eight servos, and add your own moves in Python.',
      cta: { label: 'Read the firmware', href: `${LINKS.github}/tree/main/firmware`, external: true },
    },
    {
      title: 'You’re learning robotics',
      body: 'Train walking gaits in the MuJoCo simulation, then try them on a real eight-servo body.',
      cta: { label: 'Open the simulation', href: `${LINKS.github}/tree/main/simulation`, external: true },
    },
  ],
} as const

export const OFFER = {
  title: 'Two ways to bring Molty home.',
  diy: {
    tag: 'For makers',
    title: 'Build your own',
    body: 'The firmware is public on GitHub. Grab a Pi and some servos, and build along as parts and guides are published. Free for personal, noncommercial builds.',
    cta: 'View on GitHub',
  },
  assembled: {
    tag: 'First batch pre-order',
    title: 'Molty, assembled',
    body: 'Built, calibrated, and ready for your Hermes agent. Plug it in and say hi.',
    includes: [
      'Assembled and calibrated robot',
      'Voice and wake word ready to go',
      'Connects to your cloud Hermes agent',
      'No payment today: we confirm by email',
    ],
  },
} as const

export const FAQ = [
  {
    q: 'How do I set it up?',
    a: 'Power it on, put it on your WiFi, and link your Hermes agent. Then say “Hey Molty.”',
  },
  {
    q: 'When does it ship?',
    a: 'Molty is in pre-order for the first batch. We email you a shipping estimate when we confirm your order.',
  },
  {
    q: 'Do I pay now?',
    a: 'No. Your cart sends a pre-order request by email. We reply to confirm details and payment before anything ships.',
  },
  {
    q: 'Do I need to run a server?',
    a: 'No. Your Hermes agent runs in the cloud. Molty just needs power and WiFi.',
  },
  {
    q: 'What can the agent actually do?',
    a: 'Whatever your Hermes agent can: write and fix code, research, summarize, set reminders, and more. Molty is how you talk to it, and how it shows you what it is doing.',
  },
  {
    q: 'Is it open source?',
    a: 'The firmware is source-available on GitHub under the PolyForm Noncommercial license: free to read, modify, and build for personal use.',
  },
  {
    q: 'Can I hack on it?',
    a: 'Yes. Motions are named keyframes in Python, and the agent talks to the body through a small RPC layer you can extend.',
  },
] as const

export const FOUNDER = {
  quote:
    'My agents were doing real work all day and I never saw any of it. Now there’s a little red robot on my desk that hears me, gets things done, and dances when they’re finished.',
  name: 'Jovian Dsouza',
  role: 'Creator of Molty',
  avatar: '/avatars/dsouzajovian.jpg',
} as const

export const CLOSING = {
  title: 'Say hey to Molty.',
  body: 'First batch, $150. No payment today: we confirm your order by email.',
  cta: 'Pre-order',
} as const

export const FOOTER = {
  tagline: 'A desk robot with an agent for a brain.',
  signoff: 'Built with ♥ for the physical-AI future.',
} as const
