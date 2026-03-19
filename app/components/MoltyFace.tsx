import React from 'react'

export type Mood = 'happy' | 'hyped' | 'heartbroken' | 'celebrating' | 'nervous' | 'side-eye'

interface MoltyFaceProps {
  mood?: Mood
  size?: 'sm' | 'md' | 'lg'
  animateClaws?: boolean
  className?: string
}

const HEAD_BG: Record<Mood, string> = {
  happy: '#FFD93D',
  hyped: '#FF66C4',
  heartbroken: '#B0C4DE',
  celebrating: '#5CE1E6',
  nervous: '#FFB347',
  'side-eye': '#C8B8FF',
}

const CHEEK_COLOR: Record<Mood, string> = {
  happy: '#FFB347',
  hyped: '#FF3399',
  heartbroken: '#8AACC8',
  celebrating: '#3BBFC4',
  nervous: '#FF8C42',
  'side-eye': '#9B8FE0',
}

const SIZE_MAP = {
  sm: { head: { width: 80, height: 88 }, eye: 10, eyeGap: 22, arm: { w: 18, h: 10 } },
  md: { head: { width: 144, height: 160 }, eye: 18, eyeGap: 40, arm: { w: 28, h: 16 } },
  lg: { head: { width: 192, height: 216 }, eye: 24, eyeGap: 54, arm: { w: 36, h: 20 } },
}

function getMouthStyle(mood: Mood, headW: number): React.CSSProperties {
  const base: React.CSSProperties = {
    backgroundColor: '#1A1528',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '10%',
  }

  switch (mood) {
    case 'happy':
      return { ...base, width: '52%', height: '20%', borderRadius: '0 0 999px 999px' }
    case 'hyped':
      return { ...base, width: '45%', height: '30%', borderRadius: '50%', backgroundColor: '#1A1528' }
    case 'heartbroken':
      return { ...base, width: '52%', height: '20%', borderRadius: '999px 999px 0 0', marginTop: '15%' }
    case 'celebrating':
      return { ...base, width: '60%', height: '28%', borderRadius: '6px', backgroundColor: '#1A1528' }
    case 'nervous':
      return { ...base, width: '50%', height: '8%', borderRadius: '4px', marginTop: '14%' }
    case 'side-eye':
      return {
        ...base,
        width: '32%',
        height: '16%',
        borderRadius: '0 0 999px 999px',
        marginTop: '16%',
        marginLeft: Math.round(headW * 0.32) + 'px',
        marginRight: 'auto',
      }
    default:
      return { ...base, width: '52%', height: '20%', borderRadius: '0 0 999px 999px' }
  }
}

function getEyeStyle(mood: Mood, eyeSize: number, side: 'left' | 'right'): React.CSSProperties {
  const base: React.CSSProperties = {
    width: eyeSize,
    height: eyeSize,
    backgroundColor: '#1A1528',
    borderRadius: '50%',
    flexShrink: 0,
  }

  switch (mood) {
    case 'hyped':
      return { ...base, width: eyeSize * 1.3, height: eyeSize * 1.3 }
    case 'heartbroken':
      return { ...base, width: eyeSize * 0.8, height: eyeSize * 0.8, opacity: 0.5 }
    case 'celebrating':
      return { ...base, width: eyeSize * 1.1, height: eyeSize * 1.1 }
    case 'nervous':
      return {
        ...base,
        width: eyeSize * 0.9,
        height: eyeSize * 0.9,
        transform: side === 'left' ? 'translateX(3px)' : 'translateX(-3px)',
      }
    case 'side-eye':
      return {
        ...base,
        width: eyeSize,
        height: Math.round(eyeSize * 0.55),
        borderRadius: '4px',
        transform: 'translateX(6px)',
      }
    default:
      return base
  }
}

export default function MoltyFace({
  mood = 'happy',
  size = 'md',
  animateClaws = false,
  className = '',
}: MoltyFaceProps) {
  const s = SIZE_MAP[size]
  const headColor = HEAD_BG[mood]
  const cheekColor = CHEEK_COLOR[mood]
  const eyeL = getEyeStyle(mood, s.eye, 'left')
  const eyeR = getEyeStyle(mood, s.eye, 'right')
  const mouthStyle = getMouthStyle(mood, s.head.width)
  const clawClass = animateClaws ? 'animate-claw-wave' : ''

  const antennaH = size === 'sm' ? 24 : size === 'md' ? 36 : 48
  const ledSize = size === 'sm' ? 8 : size === 'md' ? 12 : 16
  const borderW = size === 'sm' ? 2 : 3

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Antenna */}
      <div
        style={{
          width: borderW + 2,
          height: antennaH,
          backgroundColor: '#1A1528',
          borderRadius: '4px 4px 0 0',
          position: 'relative',
        }}
      >
        {/* LED */}
        <div
          className="animate-led-blink absolute -top-1 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: ledSize,
            height: ledSize,
            backgroundColor: '#FF66C4',
            boxShadow: '0 0 6px 2px #FF66C4',
            marginTop: -ledSize / 2,
          }}
        />
      </div>

      {/* Head + Arms wrapper */}
      <div className="relative" style={{ width: s.head.width }}>
        {/* Left arm */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 origin-right rounded-sm ${clawClass}`}
          style={{
            left: -s.arm.w + borderW,
            width: s.arm.w,
            height: s.arm.h,
            backgroundColor: '#1A1528',
            borderRadius: '4px 0 0 4px',
          }}
        >
          {/* Left claw tip */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: -s.arm.h * 0.4,
              width: s.arm.h * 0.55,
              height: s.arm.h * 0.55,
              backgroundColor: '#1A1528',
              borderRadius: '2px 2px 0 0',
            }}
          />
        </div>

        {/* Right arm */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 origin-left rounded-sm ${clawClass}`}
          style={{
            right: -s.arm.w + borderW,
            width: s.arm.w,
            height: s.arm.h,
            backgroundColor: '#1A1528',
            borderRadius: '0 4px 4px 0',
            animationDelay: '0.2s',
          }}
        >
          {/* Right claw tip */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: -s.arm.h * 0.4,
              width: s.arm.h * 0.55,
              height: s.arm.h * 0.55,
              backgroundColor: '#1A1528',
              borderRadius: '2px 2px 0 0',
            }}
          />
        </div>

        {/* Head */}
        <div
          style={{
            width: s.head.width,
            height: s.head.height,
            backgroundColor: headColor,
            border: `${borderW}px solid #1A1528`,
            borderRadius: '28%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Eyes row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              paddingTop: '26%',
              paddingLeft: '12%',
              paddingRight: '12%',
            }}
          >
            <div
              className="animate-blink origin-center"
              style={eyeL}
            />
            <div
              className="animate-blink origin-center"
              style={{ ...eyeR, animationDelay: '0.15s' }}
            />
          </div>

          {/* Mouth */}
          <div style={mouthStyle} />

          {/* Blush cheeks */}
          {(mood === 'happy' || mood === 'celebrating' || mood === 'hyped') && (
            <>
              <div
                style={{
                  position: 'absolute',
                  bottom: '22%',
                  left: '10%',
                  width: '18%',
                  height: '10%',
                  backgroundColor: cheekColor,
                  borderRadius: '50%',
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '22%',
                  right: '10%',
                  width: '18%',
                  height: '10%',
                  backgroundColor: cheekColor,
                  borderRadius: '50%',
                  opacity: 0.7,
                }}
              />
            </>
          )}

          {/* Tear for heartbroken */}
          {mood === 'heartbroken' && (
            <div
              style={{
                position: 'absolute',
                top: '42%',
                left: '28%',
                width: '6%',
                height: '14%',
                backgroundColor: '#6BAED6',
                borderRadius: '0 0 50% 50%',
                opacity: 0.9,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
