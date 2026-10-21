import { Check } from 'lucide-react'
import { AGENT } from '@/app/content'
import { SectionHeading } from '../SectionHeading'
import { HermesBadge } from '../HermesBadge'

export function AgentBody() {
  return (
    <section id="agent" className="section section-alt scroll-mt-20">
      <div className="site-shell split-layout">
        <div>
          <SectionHeading kicker={AGENT.kicker} title={AGENT.title}>
            {AGENT.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </SectionHeading>
          <ul className="mt-7 space-y-3">
            {AGENT.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <HermesBadge size="lg" />
          </div>
        </div>

        <figure className="card session-card" aria-label={AGENT.session.label}>
          <figcaption className="flex items-center justify-between">
            <span className="kicker kicker-accent">{AGENT.session.label}</span>
            <span className="kicker">REC ●</span>
          </figcaption>
          <ol className="mt-6 space-y-4">
            {AGENT.session.steps.map(({ who, text }) => (
              <li key={who} className="session-step">
                <span className="session-who">{who}</span>
                <p className="leading-7">{text}</p>
              </li>
            ))}
          </ol>
        </figure>
      </div>
    </section>
  )
}
