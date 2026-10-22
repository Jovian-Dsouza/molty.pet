'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { stageIndexAt } from './timeline'

export interface ScrollProgress {
  /** 0 at the top of the section, 1 once its sticky panel is about to leave. Updated outside React. */
  progressRef: RefObject<number>
  /** Re-renders only when the stage changes. */
  stageIndex: number
  /** Scrolls the page so the section shows `progress`. */
  scrollToProgress: (progress: number, behavior: ScrollBehavior) => void
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x))

/** Maps the page scroll through a tall section onto 0 → 1, once per animation frame. */
export function useScrollProgress(section: RefObject<HTMLElement | null>, onProgress?: (progress: number) => void): ScrollProgress {
  const progressRef = useRef(0)
  const [stageIndex, setStageIndex] = useState(0)
  const listener = useRef(onProgress)
  useEffect(() => {
    listener.current = onProgress
  }, [onProgress])

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const node = section.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const range = rect.height - window.innerHeight
      const progress = range > 0 ? clamp01(-rect.top / range) : 0
      progressRef.current = progress
      setStageIndex(stageIndexAt(progress))
      listener.current?.(progress)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [section])

  const scrollToProgress = (progress: number, behavior: ScrollBehavior) => {
    const node = section.current
    if (!node) return
    const top = node.getBoundingClientRect().top + window.scrollY
    const range = node.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + clamp01(progress) * range, behavior })
  }

  return { progressRef, stageIndex, scrollToProgress }
}
