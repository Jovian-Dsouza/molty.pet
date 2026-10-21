'use client'

import { useEffect, useState, type RefObject } from 'react'

/** True while the element intersects the viewport (shrunk by `rootMargin`). */
export function useInView(ref: RefObject<Element | null>, rootMargin = '0px 0px -10% 0px'): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return inView
}
