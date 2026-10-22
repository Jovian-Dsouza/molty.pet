import { ArrowUpRight } from 'lucide-react'
import { AUDIENCES } from '@/app/content'
import { SectionHeading } from '../SectionHeading'

export function Audiences() {
  return (
    <section id="who" className="section section-alt scroll-mt-20">
      <div className="site-shell">
        <SectionHeading title={AUDIENCES.title} />
        <ul className="audience-list mt-12">
          {AUDIENCES.items.map(({ title, body, cta }) => (
            <li key={title}>
              <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 flex-1 leading-7 text-muted-foreground">{body}</p>
              <a
                href={cta.href}
                className="audience-link focus-ring"
                {...(cta.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {cta.label}
                {cta.external && <ArrowUpRight aria-hidden="true" className="size-4" />}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
