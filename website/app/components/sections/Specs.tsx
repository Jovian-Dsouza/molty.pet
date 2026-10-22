import Image from 'next/image'
import { SPECS } from '@/app/content'
import { SectionHeading } from '../SectionHeading'

export function Specs() {
  return (
    <section id="specs" className="section scroll-mt-20">
      <div className="site-shell specs-layout">
        <div className="specs-photo">
          <Image src="/molty-dog-front.jpg" alt={SPECS.photoAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
        <div>
          <SectionHeading title={SPECS.title}>
            <p>{SPECS.body}</p>
          </SectionHeading>
          <dl className="spec-rows mt-8">
            {SPECS.items.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
