import { ABILITIES } from '@/app/content'
import { SectionHeading } from '../SectionHeading'

export function Abilities() {
  return (
    <section id="abilities" className="section section-alt scroll-mt-20">
      <div className="site-shell abilities-layout">
        <SectionHeading title={ABILITIES.title} className="abilities-heading">
          <p>{ABILITIES.body}</p>
        </SectionHeading>

        <dl className="ability-list">
          {ABILITIES.items.map(({ title, body }) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
