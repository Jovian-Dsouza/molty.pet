import { FLOW } from '@/app/content'
import { SectionHeading } from '../SectionHeading'
import { FlowDiagram } from './FlowDiagram'

export function Flow() {
  return (
    <section id="how" className="section scroll-mt-20">
      <div className="site-shell">
        <SectionHeading title={FLOW.title} />

        <div className="arch-scroll mt-12">
          <FlowDiagram />
        </div>
      </div>
    </section>
  )
}
