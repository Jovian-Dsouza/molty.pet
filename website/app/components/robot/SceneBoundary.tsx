'use client'

import { Component, type ReactNode } from 'react'
import Image from 'next/image'

interface SceneBoundaryProps {
  children: ReactNode
  /** Shown over the fallback photo when the canvas fails. */
  label?: string
}

interface SceneBoundaryState {
  failed: boolean
}

/**
 * The 3D canvas throws when WebGL is unavailable or a chunk fails to load.
 * Contain that here so the rest of the page (and the cart) keeps working.
 */
export class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false }

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Molty 3D scene failed to start', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="relative size-full">
        <Image src="/molty-dog-side.jpg" alt="" fill sizes="75vw" className="object-cover opacity-40" />
        <p className="kicker absolute inset-0 grid place-items-center p-6 text-center text-foreground">
          {this.props.label ?? '3D playground unavailable in this browser (WebGL is off)'}
        </p>
      </div>
    )
  }
}
