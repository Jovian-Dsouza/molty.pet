'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TEARDOWN, teardownAudio } from '@/app/teardown'

/** A stage must hold this long before its sound plays, so a fast scrub only sounds where it lands. */
const SFX_DWELL_MS = 120
/** And this long before Molty comments. */
const LINE_DWELL_MS = 700
const SFX_VOLUME = 0.55

const TRAY = TEARDOWN.stages.findIndex((s) => s.id === 'tray')

export interface TeardownSound {
  soundOn: boolean
  toggleSound: () => void
}

type Clips = Map<string, HTMLAudioElement>

function loadClips(): Clips {
  const clips: Clips = new Map()
  const add = (key: string, src: string, volume: number) => {
    const audio = new Audio(src)
    audio.preload = 'auto'
    audio.volume = volume
    clips.set(key, audio)
  }
  for (const { id, line, sfx } of TEARDOWN.stages) {
    if (sfx) add(`${id}-sfx`, teardownAudio.sfx(id), SFX_VOLUME)
    if (line) add(`${id}-line`, teardownAudio.line(id), 1)
  }
  add('reassembled-sfx', teardownAudio.sfx('reassembled'), SFX_VOLUME)
  add('reassembled-line', teardownAudio.line('reassembled'), 1)
  return clips
}

function play(audio: HTMLAudioElement | undefined) {
  if (!audio) return
  audio.currentTime = 0
  audio.play().catch((error: unknown) => {
    // Autoplay refusals and aborted loads are expected; anything else is worth seeing.
    if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) return
    console.error('Teardown audio failed to play', error)
  })
}

/**
 * Sound for the teardown: a sound effect as each stage starts, then Molty's
 * line once the stage holds. Off until the visitor turns it on.
 */
export function useTeardownSound(stageIndex: number, active: boolean): TeardownSound {
  const [soundOn, setSoundOn] = useState(false)
  const clips = useRef<Clips | null>(null)
  const voice = useRef<HTMLAudioElement | null>(null)
  const previous = useRef(stageIndex)
  const sawTray = useRef(false)

  const speak = useCallback((key: string) => {
    voice.current?.pause()
    voice.current = clips.current?.get(key) ?? null
    play(voice.current ?? undefined)
  }, [])

  const toggleSound = useCallback(() => {
    if (soundOn) {
      clips.current?.forEach((audio) => audio.pause())
      setSoundOn(false)
      return
    }
    clips.current ??= loadClips()
    // Answer the click right away with whatever fits where the visitor is.
    const stage = TEARDOWN.stages[previous.current]
    if (stage.line) speak(`${stage.id}-line`)
    setSoundOn(true)
  }, [soundOn, speak])

  useEffect(() => {
    const from = previous.current
    previous.current = stageIndex
    if (!soundOn || !active || from === stageIndex) return
    const stage = TEARDOWN.stages[stageIndex]

    if (stageIndex >= TRAY) sawTray.current = true

    const forward = stageIndex > from
    const sfx = forward ? (stage.sfx ? `${stage.id}-sfx` : null) : 'reassembled-sfx'
    const back = stageIndex === 0 && sawTray.current
    const line = back ? 'reassembled-line' : forward && stage.line ? `${stage.id}-line` : null
    // Both wait for the stage to hold; a further change cancels them.
    const timers = [
      sfx && window.setTimeout(() => play(clips.current?.get(sfx)), SFX_DWELL_MS),
      line &&
        window.setTimeout(() => {
          if (back) sawTray.current = false
          speak(line)
        }, LINE_DWELL_MS),
    ]
    return () => timers.forEach((t) => t && window.clearTimeout(t))
  }, [stageIndex, soundOn, active, speak])

  // Leaving the section (or the tab) silences everything.
  useEffect(() => {
    if (!active) clips.current?.forEach((audio) => audio.pause())
  }, [active])

  useEffect(() => () => clips.current?.forEach((audio) => audio.pause()), [])

  return { soundOn, toggleSound }
}
