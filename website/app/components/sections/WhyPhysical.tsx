import { Bot, Ear, Footprints, Sparkles, type LucideIcon } from 'lucide-react'
import { WHY } from '@/app/content'
import { SectionHeading } from '../SectionHeading'

const ICONS: Record<(typeof WHY.cards)[number]['id'], LucideIcon> = {
  moves: Footprints,
  listens: Ear,
  emotes: Sparkles,
  works: Bot,
}

export function WhyPhysical() {
  return (
    <section id="why" className="section scroll-mt-20">
      <div className="site-shell">
        <SectionHeading kicker={WHY.kicker} title={WHY.title}>
          <p>{WHY.body}</p>
        </SectionHeading>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.cards.map(({ id, title, body }, i) => {
            const Icon = ICONS[id]
            return (
              <article key={id} className="card card-chunky">
                <div className="flex items-center justify-between">
                  <span className="icon-box">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="kicker">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-mono text-sm font-bold uppercase tracking-[0.12em]">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{body}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
