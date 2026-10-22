import Image from 'next/image'
import { ArrowUpRight, Check, Github } from 'lucide-react'
import { LINKS, OFFER, PRICE_USD } from '@/app/content'
import { formatUsd } from '@/app/lib/cart'
import { SectionHeading } from '../SectionHeading'
import { AddToCartButton } from '../cart/AddToCartButton'

export function GetYours() {
  const { diy, assembled } = OFFER
  return (
    <section id="buy" className="section scroll-mt-20">
      <div className="site-shell">
        <SectionHeading title={OFFER.title} />

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="card flex flex-col">
            <p className="kicker">{diy.tag}</p>
            <h3 className="mt-3 text-2xl font-semibold">{diy.title}</h3>
            <p className="mt-3 flex-1 leading-7 text-muted-foreground">{diy.body}</p>
            <p className="mt-6 font-mono text-2xl font-bold">Free</p>
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="button button-secondary mt-5 self-start">
              <Github aria-hidden="true" className="size-4" />
              {diy.cta}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </article>

          <article className="card card-featured grid gap-6 sm:grid-cols-[1fr_0.9fr]">
            <div className="flex flex-col">
              <p className="kicker kicker-accent">{assembled.tag}</p>
              <h3 className="mt-3 text-2xl font-semibold">{assembled.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{assembled.body}</p>
              <ul className="mt-5 space-y-2.5">
                {assembled.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-4xl font-bold tabular-nums">{formatUsd(PRICE_USD)}</p>
              <AddToCartButton className="mt-5 self-start">Add to cart</AddToCartButton>
            </div>
            <div className="relative order-first min-h-56 overflow-hidden rounded-xl border border-border sm:order-none">
              <Image
                src="/molty-dog-side.jpg"
                alt="Molty's red legs, servos, and Raspberry Pi up close"
                fill
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
