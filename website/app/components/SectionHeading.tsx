import type { ReactNode } from 'react'

interface SectionHeadingProps {
  title: ReactNode
  children?: ReactNode
  className?: string
}

export function SectionHeading({ title, children, className = '' }: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <h2 className="section-title">{title}</h2>
      {children && <div className="section-copy">{children}</div>}
    </div>
  )
}
