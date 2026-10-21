import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { CartProvider } from './CartProvider'
import { CartDrawer } from './CartDrawer'
import { CartButton } from './CartButton'
import { AddToCartButton } from './AddToCartButton'
import { STORAGE_KEY } from './storage'

function Shop() {
  return (
    <CartProvider>
      <CartButton />
      <AddToCartButton>Add to cart</AddToCartButton>
      <CartDrawer />
    </CartProvider>
  )
}

const subjectOf = (href: string | null) => new URL(href ?? '').searchParams.get('subject')

describe('cart flow', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(cleanup)

  it('opens the drawer with one Molty when adding to cart', () => {
    render(<Shop />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))

    const dialog = screen.getByRole('dialog', { name: /your cart/i })
    expect(within(dialog).getByText('Molty (assembled)')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Quantity')).toHaveTextContent('1')
    expect(within(dialog).getAllByText('$150').length).toBeGreaterThan(0)
  })

  it('updates the subtotal, badge, and mailto when quantity changes', () => {
    render(<Shop />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    const dialog = screen.getByRole('dialog', { name: /your cart/i })

    fireEvent.click(within(dialog).getByRole('button', { name: /increase quantity/i }))

    expect(within(dialog).getByLabelText('Quantity')).toHaveTextContent('2')
    expect(within(dialog).getAllByText('$300').length).toBeGreaterThan(0)
    const link = within(dialog).getByRole('link', { name: /send pre-order request/i })
    expect(subjectOf(link.getAttribute('href'))).toBe('Molty pre-order — 2 units')
    expect(screen.getByRole('button', { name: /cart, 2 items/i })).toBeInTheDocument()
  })

  it('keeps focus on the stepper when quantity changes', () => {
    render(<Shop />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    const increase = screen.getByRole('button', { name: /increase quantity/i })
    increase.focus()

    fireEvent.click(increase)

    expect(document.activeElement).toBe(increase)
  })

  it('keeps focus inside the dialog when the focused button is removed', () => {
    render(<Shop />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    const dialog = screen.getByRole('dialog', { name: /your cart/i })
    within(dialog).getByRole('button', { name: /remove/i }).focus()

    fireEvent.click(within(dialog).getByRole('button', { name: /remove/i }))

    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('shows an empty state after removing the item', () => {
    render(<Shop />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    const dialog = screen.getByRole('dialog', { name: /your cart/i })

    fireEvent.click(within(dialog).getByRole('button', { name: /remove/i }))

    expect(within(dialog).getByText(/your cart is empty/i)).toBeInTheDocument()
    expect(within(dialog).queryByRole('link', { name: /send pre-order request/i })).toBeNull()
  })

  it('closes on Escape and from the close button', () => {
    render(<Shop />)
    fireEvent.click(screen.getByRole('button', { name: /cart, 0 items/i }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /cart, 0 items/i }))
    fireEvent.click(screen.getByRole('button', { name: /close cart/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('persists the cart across reloads and ignores corrupt storage', () => {
    const first = render(<Shop />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    first.unmount()

    render(<Shop />)
    expect(screen.getByRole('button', { name: /cart, 1 item/i })).toBeInTheDocument()
    cleanup()

    window.localStorage.setItem(STORAGE_KEY, '{not json')
    render(<Shop />)
    expect(screen.getByRole('button', { name: /cart, 0 items/i })).toBeInTheDocument()
  })
})
