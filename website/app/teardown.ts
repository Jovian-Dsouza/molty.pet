/**
 * Copy and audio for the teardown section: Molty coming apart, stage by stage.
 * Dependency-free so scripts/voice/generate-teardown-audio.mjs can import it.
 *
 * After changing a `line` or an `sfx` prompt, regenerate the clips:
 *   ELEVENLABS_API_KEY=… node scripts/voice/generate-teardown-audio.mjs --force
 */

export type TeardownStageId = 'whole' | 'legs' | 'shell' | 'core' | 'tray'

export type PartGroup = 'servo' | 'leg' | 'horn' | 'shell' | 'face' | 'brain' | 'driver' | 'power' | 'screw'

export interface TeardownStageCopy {
  id: TeardownStageId
  /** Short name on the scrubber. */
  label: string
  title: string
  body: string
  /**
   * Molty's voice line once this stage has held on screen for a moment; spoken
   * with ElevenLabs v3 tags. The `whole` line greets whoever turns sound on.
   */
  line: string | null
  /** ElevenLabs sound-effect prompt played as the stage starts. */
  sfx: string | null
}

export interface BomCopy {
  /** What the part is, in plain words. */
  name: string
  /** What it does for you. */
  job: string
  /** The off-the-shelf name, for people who build. */
  spec: string
}

export const TEARDOWN = {
  title: 'Take Molty apart.',
  body: 'Keep scrolling and Molty comes apart the way you would take it apart: legs, shell, then the core. Every piece is printed or off the shelf, so you can fix it yourself.',
  /** Spoken in the tray line; tests keep it equal to the parts list. */
  partCount: 61,
  scrubLabel: 'Teardown progress',
  soundOn: 'Turn sound on',
  soundOff: 'Mute',
  grid: 'Grid: 10 mm squares',
  loading: 'Laying out the parts…',
  fallback: '3D teardown unavailable in this browser (WebGL is off)',
  note: 'Geometry from the Sesame robot CAD (Apache-2.0). Molty’s Raspberry Pi and servo driver are modelled to their published sizes.',
  stages: [
    {
      id: 'whole',
      label: 'Assembled',
      title: 'Molty, as it ships.',
      body: 'About 13 cm from foot to foot. Small enough to sit next to your keyboard.',
      line: '[curious] Want to see what’s inside me? Keep scrolling.',
      sfx: null,
    },
    {
      id: 'legs',
      label: 'Legs',
      title: 'Eight servos, two per leg.',
      body: 'Each hip swings and each knee lifts. Together they run all 19 motions: walk, turn, wave, dance, bow.',
      line: 'Eight servos. Two in every leg. [excited] That’s how I walk, wave, and dance!',
      sfx: 'Small plastic robot legs unclipping from a body, quick tiny servo motor whir and soft plastic clicks, close up, clean studio',
    },
    {
      id: 'shell',
      label: 'Face and brain',
      title: 'A face to show how it feels. A brain that hears you.',
      body: 'The screen draws Molty’s mood. The Raspberry Pi on its back listens for “Hey Molty” and passes your request to your Hermes agent in the cloud.',
      line: 'This is my face. [curious] And the little computer on my back? That’s how I hear you.',
      sfx: 'A small 3D printed plastic lid popping off a gadget with a light snap, then a soft airy lift, clean studio',
    },
    {
      id: 'core',
      label: 'Core',
      title: 'One board keeps every joint steady.',
      body: 'A PCA9685 driver holds all eight servos in position while the Pi talks to the cloud. The frame and covers are 3D-printed, so a broken part is a reprint away.',
      line: '[whispers] One little board holds all eight servos steady. The rest is screws and printed plastic.',
      sfx: 'Tiny metal screws being unscrewed quickly with a precision screwdriver, ratchet ticks, then screws tinkling onto a desk',
    },
    {
      id: 'tray',
      label: 'Every part',
      title: '61 parts on your desk.',
      body: 'Printed plastic, off-the-shelf electronics, and 32 screws. Lose one, and you can print or order another.',
      line: '[nervous laugh] Sixty-one parts. Okay. Please put me back together.',
      sfx: 'Small plastic and metal parts sliding and settling neatly onto a rubber cutting mat, soft gentle clatter',
    },
  ] satisfies readonly TeardownStageCopy[],
  /** Played when someone scrolls Molty back together after seeing the tray. */
  reassembled: {
    line: '[sighs] Much better.',
    sfx: 'Satisfying sequence of crisp snap-fit clicks as a small plastic robot is assembled, ending with one solid click',
  },
  bom: {
    servo: { name: 'Servos', job: 'Move every joint', spec: 'SG90 micro servo' },
    leg: { name: 'Legs', job: 'Walk, wave, and dance', spec: 'Printed PLA' },
    horn: { name: 'Servo horns', job: 'Connect each servo to its leg', spec: 'SG90 horn' },
    shell: { name: 'Shell', job: 'Protects the electronics', spec: 'Printed PLA' },
    face: { name: 'Face', job: 'Shows how Molty feels', spec: '0.96″ OLED, 128 × 64' },
    brain: { name: 'Brain', job: 'Hears you, reaches your agent', spec: 'Raspberry Pi Zero 2 W' },
    driver: { name: 'Servo driver', job: 'Holds every joint steady', spec: 'PCA9685, 16 channels' },
    power: { name: 'Battery', job: 'Powers it all', spec: 'Li-ion pack' },
    screw: { name: 'Screws', job: 'Hold it together', spec: 'Steel, M2' },
  } satisfies Record<PartGroup, BomCopy>,
} as const

/** Public paths of the generated clips. */
export const teardownAudio = {
  line: (id: string): string => `/audio/teardown/${id}-line.mp3`,
  sfx: (id: string): string => `/audio/teardown/${id}-sfx.mp3`,
}
