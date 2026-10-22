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
  { href: '#day', label: 'A day with Molty' },
  { href: '#proof', label: 'Real robot' },
  { href: '#play', label: 'Try it' },
  { href: '#specs', label: 'Specs' },
] as const

/* ---------- Copy ---------- */

export const HERO = {
  title: 'A robot pet for your AI agent.',
  body: 'Molty sits on your desk and listens for “Hey Molty.” It hands the job to your Hermes agent in the cloud, then shows you how it’s going with its whole body.',
  cta: 'Pre-order',
  secondary: 'Watch the real one',
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

export const PROOF = {
  title: 'Same moves. Real robot.',
  body: 'Everything on the desk above already runs on the workbench: walking, waving, dancing, and talking back. A printed body, eight servos, and a Raspberry Pi.',
  caption: 'Unedited prototype footage. The launch video is on the way.',
} as const

export const ABILITIES = {
  title: 'What Molty does today.',
  body: 'Your agents already write code, research, and keep track of things, in a tab you forgot about. Molty puts that work on your desk, where you can see it.',
  items: [
    {
      title: 'Moves',
      body: '19 built-in motions: walk, turn, wave, dance, bow, push-ups, even the worm. They run on the robot, so it reacts instantly.',
    },
    {
      title: 'Listens',
      body: 'Say “Hey Molty” and talk. The wake word runs on the robot, and echo cancellation keeps Molty from hearing itself.',
    },
    {
      title: 'Shows how it feels',
      body: 'Every reply comes with body language: a dance for good news, a shrug when it isn’t sure, a bow to say goodnight.',
    },
    {
      title: 'Gets work done',
      body: 'Behind the face is your Hermes agent. Ask for code, research, or reminders and it does the work in the cloud.',
    },
  ],
} as const

export const FLOW = {
  title: 'From your voice to its legs.',
  steps: [
    { title: 'You ask', body: 'Say “Hey Molty” and ask for something, the way you’d ask a teammate.' },
    { title: 'Molty hands it off', body: 'The request goes to your Hermes agent in the cloud. Nothing to install or keep running.' },
    { title: 'Hermes does the work', body: 'Code, research, reminders: whatever your agent can do, with its own memory and tools.' },
    { title: 'Molty reports back', body: 'It tells you how it went and moves to match: a nod, a shrug, or a dance.' },
  ],
  note: {
    title: 'Fast reflexes, slow thoughts.',
    body: 'The body never waits on the cloud. Motion runs on the Pi, and the agent can only pick from named, tested moves, never raw servo angles. Smart in the cloud, safe on your desk.',
  },
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

export const SPECS = {
  title: 'What’s inside.',
  body: 'Small enough to sit next to your keyboard. Every part is printed or off the shelf, so you can fix it yourself.',
  photoAlt: 'Molty, a red four-legged robot with a Raspberry Pi on its back, standing on a workbench',
  items: [
    { label: 'Compute', value: 'Raspberry Pi Zero 2 W' },
    { label: 'Actuators', value: '8 servos on a PCA9685 driver' },
    { label: 'Motion', value: '19 named actions, run on-device' },
    { label: 'Voice', value: 'Microphone and speaker, “Hey Molty” wake word' },
    { label: 'Agent', value: 'Hermes Agent, hosted in the cloud' },
    { label: 'Connectivity', value: 'WiFi' },
    { label: 'Body', value: '3D-printed and repairable' },
    { label: 'Software', value: 'Source-available on GitHub' },
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
