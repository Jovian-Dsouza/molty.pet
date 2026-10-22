'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { SCENARIOS } from '@/app/scenarios'
import VOICE_LINES from '@/app/voice-lines.json'
import { phaseAt, sceneSchedule, type Phase, type SceneSchedule } from './timeline'
import type { StageCue } from './StageScene'

export const SCHEDULES: readonly SceneSchedule[] = SCENARIOS.map((scene) => {
  const timing = (VOICE_LINES as Record<string, { youMs: number; moltyMs: number }>)[scene.id]
  if (!timing) throw new Error(`No voice timing for scene "${scene.id}". Run scripts/voice/generate-voice-lines.mjs.`)
  return sceneSchedule(scene, timing)
})

export interface ScenarioPlayer {
  index: number
  phase: Phase
  playing: boolean
  soundOn: boolean
  /** Changes every time a scene (re)starts, to restart its progress bar. */
  runKey: number
  cueRef: RefObject<StageCue>
  select: (index: number) => void
  togglePlay: () => void
  toggleSound: () => void
}

function clipFor(index: number, phase: Phase): { src: string; startsAt: number } | null {
  const scene = SCENARIOS[index]
  if (phase === 'you' && scene.you) return { src: `/voice/${scene.id}-you.mp3`, startsAt: 0 }
  if (phase === 'molty') return { src: `/voice/${scene.id}-molty.mp3`, startsAt: SCHEDULES[index].moltyAt }
  return null
}

/**
 * Plays the day's scenes in a loop while `active` (on screen, tab visible).
 * Sound stays off until the visitor turns it on; the scene clock runs the
 * same either way.
 */
export function useScenarioPlayer(active: boolean, autoplay: boolean): ScenarioPlayer {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(phaseAt(SCHEDULES[0], 0))
  /** Null until the visitor presses play or pause; until then, follow `autoplay`. */
  const [chosen, setChosen] = useState<boolean | null>(null)
  const playing = chosen ?? autoplay
  const [soundOn, setSoundOn] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const cueRef = useRef<StageCue>({ index: 0, startedAt: 0, pausedAt: 0 })
  const phaseRef = useRef<Phase | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)
  const soundRef = useRef(false)
  const running = playing && active
  const runningRef = useRef(running)

  useEffect(() => {
    runningRef.current = running
  }, [running])

  const muteAfterRefusal = useCallback((error: unknown) => {
    // A newer clip replacing this one aborts it; only a refusal means sound is blocked.
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      soundRef.current = false
      setSoundOn(false)
    }
  }, [])

  const playClip = useCallback(() => {
    const el = audio.current
    if (!el || !soundRef.current) return
    const { index: i, startedAt, pausedAt } = cueRef.current
    const t = (pausedAt ?? performance.now()) - startedAt
    const clip = clipFor(i, phaseAt(SCHEDULES[i], t))
    if (!clip) return
    const offset = Math.max(0, (t - clip.startsAt) / 1000)
    el.muted = false
    el.src = clip.src
    if (offset > 0.05) {
      // Safari ignores seeks before metadata loads.
      el.addEventListener('loadedmetadata', () => el.src.endsWith(clip.src) && (el.currentTime = offset), { once: true })
    }
    el.play().catch(muteAfterRefusal)
  }, [muteAfterRefusal])

  const startScene = useCallback((i: number) => {
    const now = performance.now()
    // Starts paused when nothing is driving the clock; the resume effect picks it up.
    cueRef.current = { index: i, startedAt: now, pausedAt: runningRef.current ? null : now }
    phaseRef.current = null
    audio.current?.pause()
    setIndex(i)
    setPhase(phaseAt(SCHEDULES[i], 0))
    setRunKey((k) => k + 1)
  }, [])

  // Pause and resume the scene clock (and the audio) with `running`.
  useEffect(() => {
    const cue = cueRef.current
    const now = performance.now()
    if (running && cue.pausedAt !== null) {
      cueRef.current = { ...cue, startedAt: cue.startedAt + (now - cue.pausedAt), pausedAt: null }
      if (phaseRef.current !== null) playClip()
    } else if (!running && cue.pausedAt === null) {
      cueRef.current = { ...cue, pausedAt: now }
      audio.current?.pause()
    }
  }, [running, playClip])

  // The scene loop: track phase changes, start clips, advance to the next scene.
  useEffect(() => {
    if (!running) return
    let frame = 0
    const tick = () => {
      const { index: i, startedAt } = cueRef.current
      const next = phaseAt(SCHEDULES[i], performance.now() - startedAt)
      if (next === 'done') {
        startScene((i + 1) % SCENARIOS.length)
      } else if (next !== phaseRef.current) {
        phaseRef.current = next
        setPhase(next)
        playClip()
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running, startScene, playClip])

  useEffect(() => () => audio.current?.pause(), [])

  const select = useCallback(
    (i: number) => {
      startScene(i)
      setChosen(true)
    },
    [startScene],
  )

  const togglePlay = useCallback(() => setChosen(!playing), [playing])

  const toggleSound = useCallback(() => {
    const on = !soundRef.current
    soundRef.current = on
    setSoundOn(on)
    if (!on) {
      audio.current?.pause()
      return
    }
    // Start playback inside the click so later, timer-driven plays are allowed.
    const el = (audio.current ??= new Audio())
    if (cueRef.current.pausedAt === null && clipFor(cueRef.current.index, phaseRef.current ?? 'hold')) {
      playClip()
      return
    }
    // Nothing to say right now: unlock silently with this scene's reply clip.
    const unlockSrc = `/voice/${SCENARIOS[cueRef.current.index].id}-molty.mp3`
    el.muted = true
    el.src = unlockSrc
    el.play()
      .then(() => {
        if (el.muted && el.src.endsWith(unlockSrc)) el.pause()
      })
      .catch(muteAfterRefusal)
  }, [playClip, muteAfterRefusal])

  return { index, phase, playing, soundOn, runKey, cueRef, select, togglePlay, toggleSound }
}
