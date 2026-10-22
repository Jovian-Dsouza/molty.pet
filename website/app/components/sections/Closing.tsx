import Image from 'next/image'
import { CLOSING, FOUNDER, LINKS, PRICE_USD } from '@/app/content'
import { formatUsd } from '@/app/lib/cart'
import { AddToCartButton } from '../cart/AddToCartButton'

export function Closing() {
  return (
    <section className="closing">
      <div className="site-shell closing-layout">
        <figure>
          <blockquote className="text-balance text-xl font-medium leading-snug tracking-tight sm:text-2xl">
            “{FOUNDER.quote}”
          </blockquote>
          <figcaption className="mt-6">
            <a href={LINKS.creatorX} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-4 rounded-lg">
              <Image src={FOUNDER.avatar} alt="" width={44} height={44} className="rounded-full border border-border" />
              <span>
                <span className="block font-semibold">{FOUNDER.name}</span>
                <span className="block text-sm text-muted-foreground">{FOUNDER.role}</span>
              </span>
            </a>
          </figcaption>
        </figure>

        <div className="closing-cta">
          <h2 className="closing-title">{CLOSING.title}</h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{CLOSING.body}</p>
          <AddToCartButton className="mt-7">
            {CLOSING.cta} for {formatUsd(PRICE_USD)}
          </AddToCartButton>
        </div>
      </div>
    </section>
  )
}
