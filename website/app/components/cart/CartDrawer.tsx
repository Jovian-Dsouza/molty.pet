'use client'

import { useEffect, useId, useRef } from 'react'
import Image from 'next/image'
import { Mail, Minus, Plus, Trash2, X } from 'lucide-react'
import { MAX_QUANTITY, buildOrderMailto, findProduct, formatUsd, type CartLine } from '@/app/lib/cart'
import { CATALOG, ORDER_EMAIL, PRICE_USD, PRODUCT_ID } from '@/app/content'
import { useCart } from './CartProvider'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Keeps Tab inside the panel, closes on Escape, and restores focus on close. */
function useDialogFocus(panel: React.RefObject<HTMLDivElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const node = panel.current
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return closeRef.current()
      if (e.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const escaped = !node.contains(document.activeElement)
      if (escaped || (e.shiftKey && document.activeElement === first)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [panel])
}

function LineItem({ line }: { line: CartLine }) {
  const { setQty, remove } = useCart()
  const product = findProduct(CATALOG, line.productId)
  if (!product) return null

  return (
    <li className="cart-line">
      <Image
        src="/molty-dog-front.jpg"
        alt=""
        width={72}
        height={72}
        className="size-18 rounded-lg border border-border object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{product.name}</p>
        <p className="kicker mt-1">Pre-order · First batch</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="stepper">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={line.quantity <= 1}
              onClick={() => setQty(product.id, line.quantity - 1)}
            >
              <Minus aria-hidden="true" className="size-3.5" />
            </button>
            <output aria-label="Quantity" aria-live="polite">
              {line.quantity}
            </output>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={line.quantity >= MAX_QUANTITY}
              onClick={() => setQty(product.id, line.quantity + 1)}
            >
              <Plus aria-hidden="true" className="size-3.5" />
            </button>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove ${product.name} from cart`}
            onClick={() => remove(product.id)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      <p className="font-mono text-sm tabular-nums">{formatUsd(product.priceUsd * line.quantity)}</p>
    </li>
  )
}

function EmptyCart() {
  const { add } = useCart()
  return (
    <div className="grid flex-1 place-items-center p-6 text-center">
      <div>
        <p className="font-mono text-2xl text-muted-foreground" aria-hidden="true">
          (·_·)
        </p>
        <p className="mt-4 font-semibold">Your cart is empty.</p>
        <p className="mt-1 text-sm text-muted-foreground">Molty is lonely on the shelf.</p>
        <button type="button" className="button button-primary mt-6" onClick={() => add(PRODUCT_ID)}>
          Add Molty — {formatUsd(PRICE_USD)}
        </button>
      </div>
    </div>
  )
}

function CartPanel() {
  const { cart, total, close } = useCart()
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useDialogFocus(panel, close)

  // A quantity button can become disabled, or a line can be removed, while it
  // has focus. Pull focus back into the dialog instead of letting it fall to <body>.
  useEffect(() => {
    const node = panel.current
    if (node && !node.contains(document.activeElement)) node.focus()
  }, [cart])

  return (
    <div className="cart-root">
      <div className="cart-overlay" aria-hidden="true" onClick={close} />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="cart-panel">
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 id={titleId} className="text-lg font-semibold">
            Your cart
          </h2>
          <button type="button" className="icon-button" aria-label="Close cart" onClick={close}>
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto p-5">
              {cart.map((line) => (
                <LineItem key={line.productId} line={line} />
              ))}
            </ul>
            <footer className="border-t border-border p-5">
              <div className="flex items-baseline justify-between">
                <span className="kicker">Subtotal</span>
                <span className="font-mono text-xl font-bold tabular-nums">{formatUsd(total)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pre-order: no payment today. We email you to confirm shipping and payment.
              </p>
              <a href={buildOrderMailto(cart, CATALOG, ORDER_EMAIL)} className="button button-primary mt-5 w-full">
                <Mail aria-hidden="true" className="size-4" />
                Send pre-order request
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Opens your email app. No mail app? Write to{' '}
                <a className="underline underline-offset-2 hover:text-foreground" href={`mailto:${ORDER_EMAIL}`}>
                  {ORDER_EMAIL}
                </a>
                .
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

export function CartDrawer() {
  const { isOpen } = useCart()
  return isOpen ? <CartPanel /> : null
}
