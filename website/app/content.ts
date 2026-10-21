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

/** Swap this for the launch video when it's ready. */
export const LAUNCH_VIDEO = {
  src: '/molty-prototype-demo.mp4',
  poster: '/molty-dog-front.jpg',
  label: 'Molty walking, waving, and dancing on the workbench',
} as const

export const NAV = [
  { href: '#why', label: 'Why physical' },
  { href: '#agent', label: 'Agent' },
  { href: '#play', label: 'Play' },
  { href: '#specs', label: 'Specs' },
] as const

/* ---------- Copy ---------- */

export const HERO = {
  kicker: 'Physical AI · Pre-orders open',
  title: 'A desk robot with legs, moods,',
  titleAccent: 'and an agent for a brain.',
  body: 'Molty is a pocket-sized quadruped that lives on your desk. It walks, waves, and dances, and it is wired to your personal AI agent. Ask out loud and it gets done.',
  specs: [
    { label: 'Body', value: '8-servo quadruped' },
    { label: 'Brain', value: 'Hermes Agent, in the cloud' },
    { label: 'Compute', value: 'Raspberry Pi Zero 2 W' },
    { label: 'Wake word', value: '“Hey Molty”' },
  ],
} as const

export const PROOF = {
  kicker: 'Real hardware · Not a render',
  title: 'It’s real, and it’s already walking.',
  body: 'Printed body, eight servos, a Raspberry Pi, and a voice. This is the actual robot on the actual workbench, walking, waving, and dancing on command.',
  caption: 'Unedited prototype footage. Full launch video coming soon.',
} as const

export const WHY = {
  kicker: 'Why physical?',
  title: 'Your agents work hard. You just never see it.',
  body: 'Agents already write code, research, and remind you of things, invisibly, in a tab you forgot about. Molty gives that work a body you can see, hear, and talk to.',
  cards: [
    {
      id: 'moves',
      title: 'It moves',
      body: '19 built-in motions: walk, turn, wave, dance, bow, push-ups, even the worm. Every move runs on the robot itself, so it reacts instantly.',
    },
    {
      id: 'listens',
      title: 'It listens',
      body: 'Say “Hey Molty” and just talk. The wake word runs locally, and echo cancellation keeps Molty from hearing its own voice.',
    },
    {
      id: 'emotes',
      title: 'It emotes',
      body: 'Molty moves with what it says. Good news gets a little dance; a tough answer gets a shrug. Body language for your agent.',
    },
    {
      id: 'works',
      title: 'It works for you',
      body: 'Behind the cute is a real agent. Ask for code, research, or reminders and Hermes gets it done while Molty keeps you posted.',
    },
  ],
} as const

export const AGENT = {
  kicker: 'Body for your AI agent',
  title: 'Your agent finally has legs.',
  body: [
    'Molty is powered by Hermes Agent. Your agent lives in the cloud around the clock, with its own memory, tools, and skills. Molty is the part you can talk to.',
    'It listens in the room, hands the task to Hermes, and shows you what is happening with its whole body. No dashboard to check. No tab to babysit.',
  ],
  points: [
    'Always on in the cloud: no server on your desk',
    'Memory and skills that grow with you',
    'Coding, research, reminders, whatever your agent can do',
  ],
  session: {
    label: 'A real session',
    steps: [
      { who: 'You', text: '“Hey Molty, fix the failing test and open a PR.”' },
      { who: 'Hermes', text: 'Picks it up in the cloud: reads the repo, runs the tests, pushes the fix.' },
      { who: 'Molty', text: 'Nods, says it’s on it, and does a little dance when the PR is up.' },
    ],
  },
} as const

export const LOOP = {
  kicker: 'The loop',
  title: 'How it works',
  steps: [
    { title: 'Plug in', body: 'Unbox Molty, power it up, and put it on your WiFi.' },
    { title: 'Connect', body: 'Link your Hermes agent. It is hosted in the cloud, so there is nothing to install or keep running.' },
    { title: 'Talk', body: 'Say “Hey Molty” and ask for something, the way you would ask a teammate.' },
    { title: 'Watch it work', body: 'Hermes does the task. Molty reacts in the room and tells you when it is done.' },
  ],
  note: {
    title: 'Fast reflexes, slow thoughts.',
    body: 'The body never waits on the cloud. Motion runs locally on the Pi, and the agent can only choose from named, validated moves, never raw servo angles. Smart in the cloud, safe on your desk.',
  },
} as const

export const PLAY = {
  kicker: 'Try it',
  title: 'Take Molty for a walk.',
  body: 'This is Molty’s real CAD model, running the same servo keyframes as the firmware. Drive it around, push the ball into the goal, or make it wave.',
  hint: 'Click the arena · WASD / arrows to drive · click Molty to poke',
  footnote: 'Geometry from the open Sesame robot CAD (Apache-2.0). Motion is keyframe playback, not physics: the real one fits on your desk.',
} as const

export const SPECS = {
  kicker: 'Tech specs',
  title: 'What’s inside.',
  items: [
    { label: 'Compute', value: 'Raspberry Pi Zero 2 W' },
    { label: 'Actuators', value: '8 servos · PCA9685 driver' },
    { label: 'Motion', value: '19 named actions, run on-device' },
    { label: 'Voice', value: 'Microphone + speaker · “Hey Molty” wake word' },
    { label: 'Agent', value: 'Hermes Agent, hosted in the cloud' },
    { label: 'Connectivity', value: 'WiFi' },
    { label: 'Body', value: '3D-printed and repairable' },
    { label: 'Software', value: 'Source-available on GitHub' },
  ],
} as const

export const OFFER = {
  kicker: 'Get yours',
  title: 'Two ways to bring Molty home.',
  diy: {
    tag: 'For makers',
    title: 'Build your own',
    body: 'The firmware is public on GitHub. Grab a Pi and some servos, and build along as parts and guides are published. Free for personal, noncommercial builds.',
    cta: 'View on GitHub',
  },
  assembled: {
    tag: 'First batch · Pre-order',
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

export const FOOTER = {
  tagline: 'A desk robot with an agent for a brain.',
  signoff: 'Built with ♥ for the physical-AI future.',
} as const
