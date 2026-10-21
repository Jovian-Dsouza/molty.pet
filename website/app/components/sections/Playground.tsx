'use client'

import dynamic from 'next/dynamic'
import { useCallback, useRef, useState } from 'react'
import { PLAY } from '@/app/content'
import { SectionHeading } from '../SectionHeading'
import { Joystick } from '../robot/Joystick'
import { useDriveControls } from '../robot/useDriveControls'
import { useInView } from '../robot/useInView'
import { SceneBoundary } from '../robot/SceneBoundary'
import type { Telemetry, TrickRequest } from '../robot/PlaygroundScene'

const PlaygroundScene = dynamic(() => import('../robot/PlaygroundScene'), {
  ssr: false,
  loading: () => <div className="kicker grid size-full place-items-center">Booting sim…</div>,
})

/** Real firmware actions (firmware/molty/motion_catalog.py). */
const TRICKS: readonly { mode: Exclude<TrickRequest, null>; label: string }[] = [
  { mode: 'wave', label: 'Wave' },
  { mode: 'dance', label: 'Dance' },
  { mode: 'bow', label: 'Bow' },
  { mode: 'pushup', label: 'Push-up' },
  { mode: 'swim', label: 'Swim' },
  { mode: 'worm', label: 'Worm' },
  { mode: 'shake', label: 'Shake' },
  { mode: 'cute', label: 'Cute' },
]
/** Leg → [hip servo, knee servo], named as on the robot. */
const LEGS = [
  { leg: 'FL', hip: 'l1', knee: 'l3' },
  { leg: 'FR', hip: 'r1', knee: 'r3' },
  { leg: 'BL', hip: 'l2', knee: 'l4' },
  { leg: 'BR', hip: 'r2', knee: 'r4' },
] as const
const HUD_INTERVAL_MS = 100

const fmt = (deg: number) => `${deg.toFixed(0)}°`

function TelemetryPanel({ hud, onTrick }: { hud: Telemetry | null; onTrick: (t: TrickRequest) => void }) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border p-4">
        <p className="kicker mb-3">Tricks</p>
        <div className="grid grid-cols-4 gap-1.5 md:grid-cols-2">
          {TRICKS.map((t) => (
            <button
              key={t.mode}
              type="button"
              onClick={() => onTrick(t.mode)}
              aria-pressed={hud?.mode === t.mode}
              className="trick-button"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 border-b border-border">
        <div className="border-r border-border p-4">
          <dt className="kicker">Mode</dt>
          <dd className="mt-1 font-mono text-sm uppercase text-primary">{hud?.mode ?? '—'}</dd>
        </div>
        <div className="p-4">
          <dt className="kicker">Vel m/s</dt>
          <dd className="mt-1 font-mono text-sm tabular-nums">{hud ? Math.abs(hud.speed).toFixed(2) : '—'}</dd>
        </div>
      </dl>

      <div className="flex-1 p-4">
        <p className="kicker mb-3">Servos · hip / knee</p>
        <table className="w-full font-mono text-xs tabular-nums">
          <tbody>
            {LEGS.map(({ leg, hip, knee }) => (
              <tr key={leg} className="border-b border-border last:border-b-0">
                <th scope="row" className="py-1.5 text-left font-normal text-muted-foreground">
                  {leg} <span className="uppercase">{hip}/{knee}</span>
                </th>
                <td className="py-1.5 text-right">{hud ? fmt(hud.servos[hip]) : '—'}</td>
                <td className="py-1.5 text-right text-muted-foreground">{hud ? fmt(hud.servos[knee]) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Playground() {
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap)
  const [mounted, setMounted] = useState(false)
  if (inView && !mounted) setMounted(true)

  const { read, setStick } = useDriveControls(wrap, inView)
  const trickRef = useRef<TrickRequest>(null)
  const [score, setScore] = useState(0)
  const [hud, setHud] = useState<Telemetry | null>(null)
  const lastHud = useRef(0)

  const onTelemetry = useCallback((t: Telemetry) => {
    const now = performance.now()
    if (now - lastHud.current < HUD_INTERVAL_MS) return
    lastHud.current = now
    setHud(t)
  }, [])
  const onGoal = useCallback(() => setScore((s) => s + 1), [])
  const onTrick = useCallback((t: TrickRequest) => {
    trickRef.current = t
  }, [])

  return (
    <section id="play" className="section scroll-mt-20">
      <div className="site-shell">
        <SectionHeading kicker={PLAY.kicker} title={PLAY.title}>
          <p>{PLAY.body}</p>
        </SectionHeading>

        <div className="playground mt-10">
          <div
            ref={wrap}
            tabIndex={0}
            role="application"
            aria-label="Molty playground. Use W A S D or arrow keys to drive."
            className="playground-stage focus-ring"
          >
            {mounted && (
              <SceneBoundary>
                <PlaygroundScene
                  active={inView}
                  readInput={read}
                  trickRef={trickRef}
                  onTelemetry={onTelemetry}
                  onGoal={onGoal}
                />
              </SceneBoundary>
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 md:p-4">
              <div className="hud-chip">
                <p className="kicker">Goals</p>
                <p className="font-mono text-3xl font-bold leading-none text-primary tabular-nums" aria-live="polite">
                  {score}
                </p>
              </div>
              <p className="hud-chip kicker hidden md:block">{PLAY.hint}</p>
            </div>

            <div className="absolute bottom-3 left-3 hidden pointer-coarse:block">
              <Joystick onChange={setStick} />
            </div>
          </div>

          <TelemetryPanel hud={hud} onTrick={onTrick} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{PLAY.footnote}</p>
      </div>
    </section>
  )
}
