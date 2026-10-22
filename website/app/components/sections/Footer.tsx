import Image from 'next/image'
import { FOOTER, LINKS, ORDER_EMAIL } from '@/app/content'

const FOOTER_LINKS = [
  { href: LINKS.productX, label: 'Molty on X', external: true },
  { href: LINKS.github, label: 'GitHub', external: true },
  { href: LINKS.contact, label: ORDER_EMAIL, external: false },
  { href: '#top', label: 'Back to top', external: false },
] as const

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="site-shell footer-layout">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/molty-logo.png" alt="" width={36} height={36} className="size-9" />
            <span className="font-mono text-sm font-bold tracking-[0.12em]">MOLTY.PET</span>
          </div>
          <p className="mt-4 text-muted-foreground">{FOOTER.tagline}</p>
          <p className="mt-1 text-sm text-muted-foreground">{FOOTER.signoff}</p>
        </div>
        <nav aria-label="Footer navigation" className="footer-links">
          {FOOTER_LINKS.map(({ href, label, external }) => (
            <a
              key={label}
              className="footer-link focus-ring"
              href={href}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
