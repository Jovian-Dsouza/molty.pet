import Image from 'next/image'
import { NAV } from '@/app/content'
import { AddToCartButton } from '../cart/AddToCartButton'
import { CartButton } from '../cart/CartButton'

export function Header() {
  return (
    <header className="site-header">
      <div className="site-shell flex h-16 items-center justify-between gap-4">
        <a href="#top" className="focus-ring flex min-h-11 items-center gap-2 rounded-lg">
          <Image src="/molty-logo.png" alt="" width={36} height={36} className="size-9" />
          <span className="font-mono text-sm font-bold tracking-[0.12em]">MOLTY.PET</span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {NAV.map(({ href, label }) => (
            <a key={href} className="nav-link focus-ring" href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AddToCartButton className="hidden sm:inline-flex">Pre-order</AddToCartButton>
          <CartButton />
        </div>
      </div>
    </header>
  )
}
