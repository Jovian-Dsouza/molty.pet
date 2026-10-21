'use client'

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  addItem,
  itemCount,
  removeItem,
  setQuantity,
  subtotal,
  type Cart,
} from '@/app/lib/cart'
import { CATALOG } from '@/app/content'
import { createCartStore } from './storage'

interface CartContextValue {
  cart: Cart
  count: number
  total: number
  isOpen: boolean
  add: (productId: string) => void
  setQty: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  open: () => void
  close: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createCartStore(CATALOG))
  const cart = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  const [isOpen, setIsOpen] = useState(false)
  // Stable identities so consumers' effects don't re-run on every cart change.
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: itemCount(cart),
      total: subtotal(cart, CATALOG),
      isOpen,
      add: (productId) => store.update((c) => addItem(c, productId)),
      setQty: (productId, quantity) => store.update((c) => setQuantity(c, productId, quantity)),
      remove: (productId) => store.update((c) => removeItem(c, productId)),
      open,
      close,
    }),
    [cart, isOpen, store, open, close],
  )

  return <CartContext value={value}>{children}</CartContext>
}

export function useCart(): CartContextValue {
  const ctx = use(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
