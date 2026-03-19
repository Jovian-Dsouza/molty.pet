'use client'

interface MoltyVideoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: 'h-32 w-32',
  md: 'h-48 w-48',
  lg: 'h-64 w-64 sm:h-72 sm:w-72 lg:h-80 lg:w-80',
} as const

export default function MoltyVideo({ size = 'md', className = '' }: MoltyVideoProps) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border-3 border-dark shadow-chunky ${SIZE_MAP[size]} ${className}`}
      style={{ backgroundColor: '#FFF5F9' }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src="/molty-animation.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
