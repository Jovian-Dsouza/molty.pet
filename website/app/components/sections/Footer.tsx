import Image from 'next/image'
import { FOOTER, FOUNDER, LINKS, ORDER_EMAIL } from '@/app/content'

const FOOTER_LINKS = [
  { href: LINKS.productX, label: 'Molty on X', external: true },
  { href: LINKS.github, label: 'GitHub', external: true },
  { href: LINKS.contact, label: ORDER_EMAIL, external: false },
  { href: '#top', label: 'Back to top', external: false },
] as const

function Founder() {
  return (
    <section className="section">
      <div className="site-shell">
        <figure className="card founder-card">
          <p className="kicker kicker-accent">From the creator</p>
          <blockquote className="mt-5 max-w-4xl text-balance text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
            “{FOUNDER.quote}”
          </blockquote>
          <figcaption className="mt-8 border-t border-border pt-6">
            <a href={LINKS.creatorX} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-4 rounded-lg">
              <Image src={FOUNDER.avatar} alt="" width={48} height={48} className="rounded-full border border-border" />
              <span>
                <span className="block font-semibold">{FOUNDER.name}</span>
                <span className="block text-sm text-muted-foreground">{FOUNDER.role}</span>
              </span>
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <>
      <Founder />
      <footer className="border-t border-border">
        <div className="site-shell footer-layout">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/molty-logo.png" alt="" width={36} height={36} className="size-9" />
              <span className="font-mono text-sm font-bold tracking-[0.12em]">MOLTY.PET</span>
            </div>
            <p className="mt-4 text-muted-foreground">{FOOTER.tagline}</p>
            <p className="kicker mt-2">{FOOTER.signoff}</p>
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
    </>
  )
}
