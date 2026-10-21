'use client'

import type { ReactNode } from 'react'
import { ShoppingBag } from 'lucide-react'
import { PRODUCT_ID } from '@/app/content'
import { useCart } from './CartProvider'

interface AddToCartButtonProps {
  children: ReactNode
  className?: string
}

export function AddToCartButton({ children, className = '' }: AddToCartButtonProps) {
  const { add, open } = useCart()

  return (
    <button
      type="button"
      className={`button button-primary ${className}`}
      onClick={() => {
        add(PRODUCT_ID)
        open()
      }}
    >
      <ShoppingBag aria-hidden="true" className="size-4" />
      {children}
    </button>
  )
}
