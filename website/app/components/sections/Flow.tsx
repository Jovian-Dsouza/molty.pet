import { Zap } from 'lucide-react'
import { FLOW } from '@/app/content'
import { SectionHeading } from '../SectionHeading'
import { HermesBadge } from '../HermesBadge'

export function Flow() {
  return (
    <section id="how" className="section scroll-mt-20">
      <div className="site-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title={FLOW.title} />
          <HermesBadge />
        </div>

        <ol className="flow-steps mt-12">
          {FLOW.steps.map(({ title, body }, i) => (
            <li key={title}>
              <span className="flow-index" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 leading-7 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>

        <div className="note-card mt-12">
          <span className="icon-box shrink-0">
            <Zap aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="text-xl font-semibold">{FLOW.note.title}</h3>
            <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">{FLOW.note.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
