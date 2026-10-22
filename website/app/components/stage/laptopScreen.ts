import { CanvasTexture, SRGBColorSpace } from 'three'
import type { LaptopState } from '@/app/scenarios'

const WIDTH = 512
const HEIGHT = 320
const PAD = 28

const INK = '#120a09'
const TEXT = '#f3e7e4'
const MUTED = '#8f7b77'
const RED = '#ff5b59'
const GREEN = '#7fd99a'

interface Line {
  text: string
  color?: string
  size?: number
}

/** What the agent's terminal shows in each state. Diegetic UI, not page copy. */
const SCREENS: Record<Exclude<LaptopState, 'off'>, readonly Line[]> = {
  review: [
    { text: '2 pull requests need review', size: 26 },
    { text: '#41  Add crab gait', color: MUTED },
    { text: '#42  Tune wave timing', color: MUTED },
    { text: '✓ nightly build passed', color: GREEN },
  ],
  failing: [
    { text: '✗ 1 test failing', color: RED, size: 30 },
    { text: 'test_gait.py::test_stand', color: MUTED },
    { text: '47 passed, 1 failed', color: MUTED },
  ],
  working: [
    { text: 'hermes is working', size: 26 },
    { text: '› reading the repo', color: MUTED },
    { text: '› patching test_gait.py', color: MUTED },
    { text: '› running the tests', color: RED },
  ],
  passing: [
    { text: '✓ PR #43 merged', color: GREEN, size: 32 },
    { text: '48 passed, 0 failed', color: MUTED },
    { text: 'deployed to main', color: MUTED },
  ],
}

export interface LaptopScreen {
  texture: CanvasTexture
  show: (state: LaptopState) => void
  dispose: () => void
}

function monoFamily(): string {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-space-mono').trim()
  return family ? `${family}, monospace` : 'monospace'
}

function draw(ctx: CanvasRenderingContext2D, state: LaptopState): void {
  ctx.fillStyle = state === 'off' ? '#030202' : INK
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  if (state === 'off') return

  const font = monoFamily()
  ctx.fillStyle = MUTED
  ctx.font = `18px ${font}`
  ctx.fillText('hermes — ~/molty', PAD, PAD + 8)
  ctx.fillStyle = '#2a1a18'
  ctx.fillRect(PAD, PAD + 24, WIDTH - PAD * 2, 2)

  let y = PAD + 80
  for (const { text, color = TEXT, size = 22 } of SCREENS[state]) {
    ctx.fillStyle = color
    ctx.font = `${size}px ${font}`
    ctx.fillText(text, PAD, y)
    y += size + 22
  }
}

export function createLaptopScreen(): LaptopScreen {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable for the laptop screen')

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4

  let shown: LaptopState | null = null
  const show = (state: LaptopState) => {
    if (state === shown) return
    shown = state
    draw(ctx, state)
    texture.needsUpdate = true
  }
  show('review')

  // Redraw once the web font is ready; the first frame may have used a fallback.
  document.fonts?.ready.then(() => {
    if (shown) draw(ctx, shown)
    texture.needsUpdate = true
  })

  return { texture, show, dispose: () => texture.dispose() }
}
