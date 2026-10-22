/**
 * A day on the desk, acted out by the CAD Molty in the hero stage.
 *
 * Each scene pairs a spoken request with Molty's reply and the body language
 * the firmware would choose for it (firmware/molty/emotion.py). Voice clips in
 * public/voice/ are generated from these lines by
 * scripts/voice/generate-voice-lines.mjs — rerun it after editing a line.
 *
 * Only type imports here: the voice script loads this file with Node's
 * built-in type stripping.
 */

import type { ActionName } from './components/robot/motions'
import type { Mood } from './components/robot/face'

/** What the laptop on the desk shows. */
export type LaptopState = 'review' | 'failing' | 'working' | 'passing' | 'off'

/** Lighting preset for the time of day. */
export type DayLight = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'

export interface Scenario {
  id: string
  /** 24-hour clock time shown on the timeline. */
  time: string
  title: string
  /** What you'd use Molty for here, in one line. */
  useCase: string
  /** Your request. Null when Molty speaks up on its own. */
  you: string | null
  molty: string
  /** As the agent would pass to express_emotion. */
  emotion: { name: string; intensity: 'subtle' | 'normal' | 'big' }
  /** Firmware actions, played in order while Molty speaks. */
  actions: readonly ActionName[]
  mood: Mood
  /** Laptop screen while you speak, then once Molty replies. */
  laptop: readonly [LaptopState, LaptopState]
  light: DayLight
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'morning',
    time: '09:05',
    title: 'Catch up',
    useCase: 'Ask what changed while you were away.',
    you: 'Hey Molty, what did I miss overnight?',
    molty: 'Morning! Two pull requests need your review, and the nightly build passed.',
    emotion: { name: 'joyful', intensity: 'subtle' },
    actions: ['wave'],
    mood: 'happy',
    laptop: ['review', 'review'],
    light: 'morning',
  },
  {
    id: 'fix',
    time: '11:40',
    title: 'Hand off a fix',
    useCase: 'Give your agent a coding task without opening a tab.',
    you: 'Hey Molty, fix the failing test and open a PR.',
    molty: 'On it. Hermes is reading the repo now.',
    emotion: { name: 'curious', intensity: 'normal' },
    actions: ['point'],
    mood: 'focus',
    laptop: ['failing', 'working'],
    light: 'noon',
  },
  {
    id: 'stretch',
    time: '14:20',
    title: 'Set a reminder',
    useCase: 'Set reminders out loud and get them back in person.',
    you: 'Remind me to stretch in fifty minutes.',
    molty: 'Deal. I’ll come get you at ten past three.',
    emotion: { name: 'calm', intensity: 'subtle' },
    actions: ['bow'],
    mood: 'happy',
    laptop: ['working', 'working'],
    light: 'afternoon',
  },
  {
    id: 'research',
    time: '16:05',
    title: 'Ask a quick question',
    useCase: 'Research something small without breaking focus.',
    you: 'Which servo should I use for the new legs?',
    molty: 'Hmm. The SG90 is cheaper, but the MG90S has metal gears. Want a side-by-side?',
    emotion: { name: 'uncertain', intensity: 'normal' },
    actions: ['shrug'],
    mood: 'unsure',
    laptop: ['working', 'working'],
    light: 'afternoon',
  },
  {
    id: 'shipped',
    time: '17:30',
    title: 'Hear when it ships',
    useCase: 'Molty tells you the moment your agent finishes.',
    you: null,
    molty: 'Your PR is merged, and every test is green!',
    emotion: { name: 'excited', intensity: 'big' },
    actions: ['dance', 'wave'],
    mood: 'happy',
    laptop: ['passing', 'passing'],
    light: 'evening',
  },
  {
    id: 'night',
    time: '23:10',
    title: 'Sign off',
    useCase: 'Your agent keeps working after you log off.',
    you: 'Goodnight, Molty.',
    molty: 'Night! I’ll let you know if the build breaks.',
    emotion: { name: 'affectionate', intensity: 'subtle' },
    actions: ['bow'],
    mood: 'sleepy',
    laptop: ['off', 'off'],
    light: 'night',
  },
]
