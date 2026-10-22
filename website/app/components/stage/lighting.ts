import type { DayLight } from '@/app/scenarios'

type Vec3 = readonly [number, number, number]

export interface LightPreset {
  /** Wall and fog colour. */
  room: string
  /** Light through the window behind the desk. */
  window: string
  windowGlow: number
  key: string
  keyIntensity: number
  keyPosition: Vec3
  ambient: number
}

/** One room, five times of day. Warm and dim throughout so the red robot stays brightest. */
export const LIGHTING: Record<DayLight, LightPreset> = {
  morning: {
    room: '#1f110d',
    window: '#ffc9a3',
    windowGlow: 0.42,
    key: '#ffd9bd',
    keyIntensity: 2.4,
    keyPosition: [-5, 6, 2],
    ambient: 0.55,
  },
  noon: {
    room: '#1c100e',
    window: '#f6e8de',
    windowGlow: 0.45,
    key: '#fff4ec',
    keyIntensity: 2.8,
    keyPosition: [-1, 9, 3],
    ambient: 0.6,
  },
  afternoon: {
    room: '#1e100c',
    window: '#ffd8b0',
    windowGlow: 0.4,
    key: '#ffe2c4',
    keyIntensity: 2.4,
    keyPosition: [3, 7, 3],
    ambient: 0.5,
  },
  evening: {
    room: '#200d09',
    window: '#ff8a55',
    windowGlow: 0.5,
    key: '#ff9e6e',
    keyIntensity: 2.1,
    keyPosition: [6, 3.5, 2],
    ambient: 0.4,
  },
  night: {
    room: '#07070d',
    window: '#2a3566',
    windowGlow: 0.55,
    key: '#93a7ff',
    keyIntensity: 0.7,
    keyPosition: [-3, 6, 4],
    ambient: 0.22,
  },
}
