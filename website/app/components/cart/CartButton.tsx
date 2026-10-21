'use client'

import { ShoppingBag } from 'lucide-react'
import { useCart } from './CartProvider'

export function CartButton() {
  const { count, open } = useCart()
  const label = `Cart, ${count} ${count === 1 ? 'item' : 'items'}`

  return (
    <button type="button" onClick={open} aria-label={label} className="button button-secondary cart-button">
      <ShoppingBag aria-hidden="true" className="size-4" />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span aria-hidden="true" className="cart-badge">
          {count}
        </span>
      )}
    </button>
  )
}
