import { Plus } from 'lucide-react'
import { FAQ } from '@/app/content'
import { SectionHeading } from '../SectionHeading'

export function Faq() {
  return (
    <section id="faq" className="section section-alt scroll-mt-20">
      <div className="site-shell grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <SectionHeading kicker="FAQ" title="Good questions." />
        <div className="faq-list">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="faq-item">
              <summary>
                {q}
                <Plus aria-hidden="true" className="faq-icon size-4 shrink-0" />
              </summary>
              <p className="pb-5 leading-7 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
