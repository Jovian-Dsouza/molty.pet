'use client'

import dynamic from 'next/dynamic'
import { useRef, type CSSProperties } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { STAGE } from '@/app/content'
import { SCENARIOS } from '@/app/scenarios'
import { SceneBoundary } from '../robot/SceneBoundary'
import { useInView } from '../robot/useInView'
import { usePageVisible } from './usePageVisible'
import { useReducedMotion } from './useReducedMotion'
import { SCHEDULES, useScenarioPlayer, type ScenarioPlayer } from './useScenarioPlayer'

const StageScene = dynamic(() => import('./StageScene'), {
  ssr: false,
  loading: () => <p className="stage-loading">{STAGE.loading}</p>,
})

function Controls({ player }: { player: ScenarioPlayer }) {
  const { playing, soundOn, togglePlay, toggleSound } = player
  return (
    <div className="stage-controls">
      <button type="button" className="stage-button" onClick={toggleSound} data-on={soundOn}>
        {soundOn ? <Volume2 aria-hidden="true" className="size-4" /> : <VolumeX aria-hidden="true" className="size-4" />}
        <span>{soundOn ? STAGE.soundOff : STAGE.soundOn}</span>
      </button>
      <button type="button" className="stage-button stage-button-icon" onClick={togglePlay} aria-label={playing ? STAGE.pause : STAGE.play}>
        {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
      </button>
    </div>
  )
}

function Caption({ player }: { player: ScenarioPlayer }) {
  const scene = SCENARIOS[player.index]
  const replying = player.phase === 'molty' || player.phase === 'hold'
  return (
    <figure className="stage-caption">
      <figcaption>
        <p className="stage-title">{scene.title}</p>
        <p className="stage-usecase">{scene.useCase}</p>
      </figcaption>
      <dl className="stage-dialog">
        {scene.you && (
          <div data-speaking={player.phase === 'you'}>
            <dt>{STAGE.you}</dt>
            <dd>“{scene.you}”</dd>
          </div>
        )}
        <div data-speaking={player.phase === 'molty'} data-hidden={!replying}>
          <dt>{STAGE.molty}</dt>
          <dd>“{scene.molty}”</dd>
        </div>
      </dl>
      <dl className="stage-telemetry" data-hidden={!replying}>
        <div>
          <dt>Emotion</dt>
          <dd>
            {scene.emotion.name}, {scene.emotion.intensity}
          </dd>
        </div>
        <div>
          <dt>Moves</dt>
          <dd>{scene.actions.join(', ')}</dd>
        </div>
      </dl>
    </figure>
  )
}

function Timeline({ player, running }: { player: ScenarioPlayer; running: boolean }) {
  return (
    <ol className="stage-timeline" aria-label={STAGE.label}>
      {SCENARIOS.map((scene, i) => {
        const active = i === player.index
        return (
          <li key={scene.id}>
            <button
              type="button"
              className="stage-moment"
              aria-current={active ? 'step' : undefined}
              onClick={() => player.select(i)}
            >
              <time className="stage-time">{scene.time}</time>
              <span className="stage-moment-title">{scene.title}</span>
              {active && (
                <span
                  key={player.runKey}
                  aria-hidden="true"
                  className="stage-progress"
                  style={
                    {
                      '--scene-ms': `${SCHEDULES[i].total}ms`,
                      animationPlayState: running ? 'running' : 'paused',
                    } as CSSProperties
                  }
                />
              )}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

/** Molty acting out a day on a desk, with captions, voice, and a timeline. */
export function ScenarioStage() {
  const wrap = useRef<HTMLDivElement>(null)
  const inView = useInView(wrap, '0px')
  const visible = usePageVisible()
  const reduced = useReducedMotion()
  const player = useScenarioPlayer(inView && visible, !reduced)
  const running = player.playing && inView && visible

  return (
    <div id="day" className="stage scroll-mt-16">
      <div ref={wrap} className="stage-viewport">
        <div className="stage-canvas">
          <SceneBoundary label="3D stage unavailable in this browser (WebGL is off)">
            <StageScene cueRef={player.cueRef} schedules={SCHEDULES} active={running} still={reduced} />
          </SceneBoundary>
        </div>
        <Controls player={player} />
        <Caption player={player} />
      </div>
      <div className="site-shell">
        <Timeline player={player} running={running} />
        <p className="stage-note">{STAGE.note}</p>
      </div>
    </div>
  )
}
