import Image from 'next/image'
import { LINKS } from '@/app/content'

interface HermesBadgeProps {
  size?: 'sm' | 'lg'
}

/** "Powered by Hermes Agent" mark. Logo © Nous Research (MIT, hermes-agent repo). */
export function HermesBadge({ size = 'sm' }: HermesBadgeProps) {
  const px = size === 'lg' ? 56 : 32
  return (
    <a
      href={LINKS.hermes}
      target="_blank"
      rel="noreferrer"
      className={`hermes-badge focus-ring ${size === 'lg' ? 'hermes-badge-lg' : ''}`}
    >
      <span className="hermes-logo" style={{ width: px, height: px }}>
        <Image src="/hermes-agent-logo-dark.png" alt="" width={px} height={px} />
      </span>
      <span className="text-left leading-tight">
        <span className="kicker block">Powered by</span>
        <span className="block font-semibold">Hermes Agent</span>
      </span>
    </a>
  )
}
