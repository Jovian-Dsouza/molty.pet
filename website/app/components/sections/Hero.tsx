import Image from 'next/image'
import { Play } from 'lucide-react'
import { HERO, PRICE_USD } from '@/app/content'
import { formatUsd } from '@/app/lib/cart'
import { AddToCartButton } from '../cart/AddToCartButton'
import { HermesBadge } from '../HermesBadge'

export function Hero() {
  return (
    <section id="top" className="hero-section ambient-grid scroll-mt-24">
      <div className="site-shell grid items-center gap-12 py-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-20">
        <div className="relative z-10">
          <p className="eyebrow">
            <span className="status-dot" aria-hidden="true" />
            {HERO.kicker}
          </p>

          <h1 className="mt-6 max-w-[16ch] text-balance text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-[4.25rem]">
            {HERO.title} <span className="text-primary">{HERO.titleAccent}</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">{HERO.body}</p>

          <dl className="spec-list mt-8">
            {HERO.specs.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}:</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-4">
            <div>
              <p className="font-mono text-4xl font-bold tabular-nums">{formatUsd(PRICE_USD)}</p>
              <p className="kicker mt-1">Price · Pre-order</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <AddToCartButton>Add to cart — {formatUsd(PRICE_USD)}</AddToCartButton>
              <a href="#proof" className="button button-secondary">
                <Play aria-hidden="true" className="size-4 fill-current" />
                Watch it move
              </a>
            </div>
          </div>

          <div className="mt-8">
            <HermesBadge />
          </div>
        </div>

        <div className="relative z-10">
          <div className="hero-photo-frame">
            <Image
              src="/molty-dog-front.jpg"
              alt="Molty, a red four-legged desk robot with a Raspberry Pi on its back, standing on a desk"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <span className="hud-label left-4 top-4">
              <span className="status-dot" aria-hidden="true" />
              CAM-01 · LIVE
            </span>
            <span className="hud-label bottom-4 right-4">MOOD: HAPPY (^‿^)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
