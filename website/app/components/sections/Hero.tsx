import { Play } from 'lucide-react'
import { HERO, PRICE_USD } from '@/app/content'
import { formatUsd } from '@/app/lib/cart'
import { AddToCartButton } from '../cart/AddToCartButton'
import { ScenarioStage } from '../stage/ScenarioStage'

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="site-shell hero-intro">
        <h1 className="hero-title">{HERO.title}</h1>
        <div className="hero-aside">
          <p className="text-pretty text-lg leading-8 text-muted-foreground">{HERO.body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <AddToCartButton>
              {HERO.cta} for {formatUsd(PRICE_USD)}
            </AddToCartButton>
            <a href="#proof" className="button button-secondary">
              <Play aria-hidden="true" className="size-4 fill-current" />
              {HERO.secondary}
            </a>
          </div>
        </div>
      </div>
      <ScenarioStage />
    </section>
  )
}
