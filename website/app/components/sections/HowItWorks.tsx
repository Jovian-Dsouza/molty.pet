import { Zap } from 'lucide-react'
import { LOOP } from '@/app/content'
import { SectionHeading } from '../SectionHeading'

export function HowItWorks() {
  return (
    <section id="how" className="section scroll-mt-20">
      <div className="site-shell">
        <SectionHeading kicker={LOOP.kicker} title={LOOP.title} />

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOOP.steps.map(({ title, body }, i) => (
            <li key={title} className="card">
              <span className="font-mono text-3xl font-bold text-primary tabular-nums">0{i + 1}</span>
              <h3 className="mt-4 font-mono text-sm font-bold uppercase tracking-[0.12em]">{title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>

        <div className="note-card mt-4">
          <span className="icon-box shrink-0">
            <Zap aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="text-xl font-semibold">{LOOP.note.title}</h3>
            <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">{LOOP.note.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
