import type { ReactNode } from 'react'

interface SectionHeadingProps {
  kicker: string
  title: ReactNode
  children?: ReactNode
  className?: string
}

export function SectionHeading({ kicker, title, children, className = '' }: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <p className="kicker kicker-accent">{kicker}</p>
      <h2 className="section-title">{title}</h2>
      {children && <div className="section-copy">{children}</div>}
    </div>
  )
}
