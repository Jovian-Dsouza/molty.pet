'use client'

import dynamic from 'next/dynamic'
import { useCallback, useRef, useState, type ChangeEvent } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { TEARDOWN } from '@/app/teardown'
import { SceneBoundary } from '../robot/SceneBoundary'
import { useInView } from '../robot/useInView'
import { usePageVisible } from '../stage/usePageVisible'
import { useReducedMotion } from '../stage/useReducedMotion'
import { BOM } from '../teardown/parts'
import { STAGES, stageTarget } from '../teardown/timeline'
import { useScrollProgress } from '../teardown/useScrollProgress'
import { useTeardownSound } from '../teardown/useTeardownSound'
import '../teardown/teardown.css'

const TeardownScene = dynamic(() => import('../teardown/TeardownScene'), {
  ssr: false,
  loading: () => <p className="stage-loading">{TEARDOWN.loading}</p>,
})

const SCRUB_STEPS = 1000

/** Molty taking itself apart as you scroll, ending with every part laid out on a mat. */
export function Teardown() {
  const section = useRef<HTMLElement>(null)
  /** The tall element the sticky panel rides through; its scroll range is 0 → 1. */
  const track = useRef<HTMLDivElement>(null)
  const scrub = useRef<HTMLInputElement>(null)
  const reduced = useReducedMotion()
  const visible = usePageVisible()
  // Start loading the model a screen early so it is ready on arrival.
  const near = useInView(section, '100% 0px 100% 0px')
  const inView = useInView(section, '0px')
  const [mounted, setMounted] = useState(false)
  if (near && !mounted) setMounted(true)

  const onProgress = useCallback((progress: number) => {
    const input = scrub.current
    if (!input) return
    input.value = String(Math.round(progress * SCRUB_STEPS))
    input.style.setProperty('--fill', `${progress * 100}%`)
  }, [])
  const { progressRef, stageIndex, scrollToProgress } = useScrollProgress(track, onProgress)
  const { soundOn, toggleSound } = useTeardownSound(stageIndex, inView && visible)
  const stage = TEARDOWN.stages[stageIndex]

  const onScrub = (e: ChangeEvent<HTMLInputElement>) => scrollToProgress(Number(e.target.value) / SCRUB_STEPS, 'instant')
  const jump = (index: number) => scrollToProgress(stageTarget(index), reduced ? 'instant' : 'smooth')

  return (
    <section ref={section} id="inside" className="teardown scroll-mt-16" aria-labelledby="teardown-title" data-stage={stage.id}>
      <div ref={track} className="teardown-track">
        <div className="teardown-sticky">
          <div className="teardown-canvas">
            {mounted && (
              <SceneBoundary label={TEARDOWN.fallback}>
                <TeardownScene progressRef={progressRef} stageIndex={stageIndex} active={inView && visible} still={reduced} />
              </SceneBoundary>
            )}
          </div>

          <div className="site-shell teardown-top">
            <div className="teardown-intro" data-hidden={stageIndex > 0}>
              <h2 id="teardown-title" className="section-title">
                {TEARDOWN.title}
              </h2>
              <p className="section-copy">{TEARDOWN.body}</p>
            </div>
            <button type="button" className="stage-button teardown-sound" onClick={toggleSound} data-on={soundOn}>
              {soundOn ? <Volume2 aria-hidden="true" className="size-4" /> : <VolumeX aria-hidden="true" className="size-4" />}
              <span className="max-sm:sr-only">{soundOn ? TEARDOWN.soundOff : TEARDOWN.soundOn}</span>
            </button>
          </div>

          <div className="site-shell teardown-bottom">
            <div className="teardown-caption" aria-live="polite">
              <p className="teardown-caption-title">{stage.title}</p>
              <p className="teardown-caption-body">{stage.body}</p>
              {stage.id === 'tray' && (
                <ol className="teardown-bom">
                  {BOM.map(({ item, name, count }) => (
                    <li key={item}>
                      <span className="balloon">{item}</span>
                      <span>{name}</span>
                      <span className="teardown-bom-count">× {count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="teardown-controls">
              <input
                ref={scrub}
                type="range"
                min={0}
                max={SCRUB_STEPS}
                defaultValue={0}
                onChange={onScrub}
                className="teardown-scrub"
                aria-label={TEARDOWN.scrubLabel}
                aria-valuetext={stage.label}
              />
              <ol className="teardown-steps">
                {STAGES.map(({ id }, i) => (
                  <li key={id}>
                    <button type="button" className="teardown-step" aria-current={i === stageIndex ? 'step' : undefined} onClick={() => jump(i)}>
                      {TEARDOWN.stages[i].label}
                    </button>
                  </li>
                ))}
              </ol>
              <p className="teardown-grid">{TEARDOWN.grid}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="site-shell teardown-note">{TEARDOWN.note}</p>
    </section>
  )
}
