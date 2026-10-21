import { SPECS } from '@/app/content'
import { SectionHeading } from '../SectionHeading'

export function Specs() {
  return (
    <section id="specs" className="section section-alt scroll-mt-20">
      <div className="site-shell">
        <SectionHeading kicker={SPECS.kicker} title={SPECS.title} />
        <dl className="spec-grid mt-12">
          {SPECS.items.map(({ label, value }) => (
            <div key={label}>
              <dt className="kicker">{label}</dt>
              <dd className="mt-2 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
