import { FLOW } from '@/app/content'
import { SectionHeading } from '../SectionHeading'
import { FlowDiagram } from './FlowDiagram'

export function Flow() {
  return (
    <section id="how" className="section scroll-mt-20">
      <div className="site-shell">
        <SectionHeading title={FLOW.title}>
          <p>{FLOW.caption}</p>
        </SectionHeading>

        <div className="arch-scroll mt-12">
          <FlowDiagram />
        </div>
      </div>
    </section>
  )
}
