'use client'

import { useState, type ReactNode } from 'react'
import { Flame, HeartCrack, PartyPopper, AlertTriangle, Eye } from 'lucide-react'
import MoltyFace, { type Mood } from './MoltyFace'

const MOODS: Array<{ mood: Mood; label: string; icon: ReactNode; iconColor: string; bg: string; trigger: string }> = [
  { mood: 'hyped', label: 'hyped', icon: <Flame className="h-6 w-6" fill="currentColor" strokeWidth={1.5} />, iconColor: '#FF4500', bg: '#FF66C4', trigger: 'Big win. Could be anything.' },
  { mood: 'heartbroken', label: 'heartbroken', icon: <HeartCrack className="h-6 w-6" fill="currentColor" strokeWidth={1.5} />, iconColor: '#E84393', bg: '#B0C4DE', trigger: 'That trade. That project. That day.' },
  { mood: 'celebrating', label: 'celebrating', icon: <PartyPopper className="h-6 w-6" fill="currentColor" strokeWidth={1.5} />, iconColor: '#6E54FF', bg: '#5CE1E6', trigger: 'You asked it to — and it did.' },
  { mood: 'nervous', label: 'nervous', icon: <AlertTriangle className="h-6 w-6" fill="currentColor" strokeWidth={1.5} />, iconColor: '#FF8C00', bg: '#FFB347', trigger: 'Something\'s about to happen.' },
  { mood: 'side-eye', label: 'side-eye', icon: <Eye className="h-6 w-6" fill="currentColor" strokeWidth={1.5} />, iconColor: '#8B5CF6', bg: '#C8B8FF', trigger: 'You know what you did.' },
]

export default function MoodShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = MOODS[activeIndex]

  return (
    <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
      {/* Left: Molty face with mood bg */}
      <div className="relative flex shrink-0 items-center justify-center">
        {/* Glow ring */}
        <div
          className="absolute h-56 w-56 rounded-full opacity-30 blur-2xl transition-colors duration-500 sm:h-64 sm:w-64"
          style={{ backgroundColor: active.bg }}
        />
        <div
          className="relative rounded-3xl border-3 p-8 shadow-chunky transition-all duration-500"
          style={{
            borderWidth: 3,
            borderColor: '#1A1528',
            backgroundColor: active.bg + '25',
          }}
        >
          <MoltyFace mood={active.mood} size="lg" animateClaws />
        </div>
        {/* Floating emoji */}
        <span
          className="absolute -top-4 -right-4 animate-float"
          style={{ animationDelay: '0.5s', color: active.iconColor }}
        >
          <span className="[&>svg]:h-9 [&>svg]:w-9">{active.icon}</span>
        </span>
      </div>

      {/* Right: Mood selector */}
      <div className="flex flex-1 flex-col gap-3">
        <p className="font-retro text-sm tracking-widest uppercase" style={{ color: '#6E54FF' }}>
          Tap a mood
        </p>
        {MOODS.map((m, i) => {
          const isActive = i === activeIndex
          return (
            <button
              key={m.mood}
              onClick={() => setActiveIndex(i)}
              className="group flex items-center gap-4 rounded-2xl border-3 px-5 py-4 text-left transition-all duration-300"
              style={{
                borderWidth: 3,
                borderColor: isActive ? '#1A1528' : '#1A152815',
                backgroundColor: isActive ? m.bg + '30' : 'transparent',
                boxShadow: isActive ? '4px 4px 0px #1A1528' : 'none',
                transform: isActive ? 'translate(-2px, -2px)' : 'none',
              }}
            >
              <span style={{ color: m.iconColor, opacity: isActive ? 1 : 0.5 }}>{m.icon}</span>
              <div className="flex-1">
                <span
                  className="font-heading text-lg font-bold capitalize"
                  style={{ color: isActive ? '#1A1528' : '#1A152880' }}
                >
                  {m.label}
                </span>
                <p
                  className="font-body text-sm transition-opacity duration-300"
                  style={{
                    color: '#1A152870',
                    opacity: isActive ? 1 : 0,
                    maxHeight: isActive ? 40 : 0,
                    overflow: 'hidden',
                    transition: 'opacity 0.3s, max-height 0.3s',
                  }}
                >
                  {m.trigger}
                </p>
              </div>
              {isActive && (
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: m.bg, boxShadow: `0 0 8px ${m.bg}` }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
