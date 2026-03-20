'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { track } from '@vercel/analytics'

interface SectionTrackerProps {
  sectionId: string
  children: ReactNode
}

export default function SectionTracker({ sectionId, children }: SectionTrackerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const viewedRef = useRef(false)
  const entryTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entryTimeRef.current = Date.now()
          if (!viewedRef.current) {
            viewedRef.current = true
            track('section_view', { section: sectionId })
          }
        } else if (entryTimeRef.current !== null) {
          const seconds = Math.round((Date.now() - entryTimeRef.current) / 1000)
          entryTimeRef.current = null
          if (seconds > 3) {
            track('section_engaged', { section: sectionId, seconds })
          }
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [sectionId])

  return <div ref={ref}>{children}</div>
}
