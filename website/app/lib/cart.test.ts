import { describe, expect, it } from 'vitest'
import {
  MAX_QUANTITY,
  addItem,
  buildOrderMailto,
  formatUsd,
  itemCount,
  parseCart,
  removeItem,
  setQuantity,
  subtotal,
  type Cart,
  type Catalog,
} from './cart'

const catalog: Catalog = {
  molty: { id: 'molty', name: 'Molty', priceUsd: 150 },
  stand: { id: 'stand', name: 'Desk stand', priceUsd: 20 },
}

describe('addItem', () => {
  it('adds a new line to an empty cart', () => {
    expect(addItem([], 'molty')).toEqual([{ productId: 'molty', quantity: 1 }])
  })

  it('merges into an existing line instead of duplicating it', () => {
    const cart = addItem(addItem([], 'molty'), 'molty', 2)
    expect(cart).toEqual([{ productId: 'molty', quantity: 3 }])
  })

  it('caps quantity at MAX_QUANTITY', () => {
    expect(addItem([], 'molty', 99)[0].quantity).toBe(MAX_QUANTITY)
  })

  it('does not mutate the original cart', () => {
    const original: Cart = [{ productId: 'molty', quantity: 1 }]
    const snapshot = structuredClone(original)
    addItem(original, 'molty')
    addItem(original, 'stand')
    expect(original).toEqual(snapshot)
  })
})

describe('setQuantity', () => {
  it('clamps between 1 and MAX_QUANTITY', () => {
    const cart: Cart = [{ productId: 'molty', quantity: 2 }]
    expect(setQuantity(cart, 'molty', 0)[0].quantity).toBe(1)
    expect(setQuantity(cart, 'molty', 42)[0].quantity).toBe(MAX_QUANTITY)
    expect(setQuantity(cart, 'molty', 4)[0].quantity).toBe(4)
  })

  it('ignores products that are not in the cart', () => {
    const cart: Cart = [{ productId: 'molty', quantity: 2 }]
    expect(setQuantity(cart, 'stand', 3)).toEqual(cart)
  })
})

describe('removeItem', () => {
  it('removes only the matching line', () => {
    const cart: Cart = [
      { productId: 'molty', quantity: 1 },
      { productId: 'stand', quantity: 2 },
    ]
    expect(removeItem(cart, 'molty')).toEqual([{ productId: 'stand', quantity: 2 }])
  })
})

describe('totals', () => {
  const cart: Cart = [
    { productId: 'molty', quantity: 2 },
    { productId: 'stand', quantity: 1 },
  ]

  it('counts items across lines', () => {
    expect(itemCount(cart)).toBe(3)
    expect(itemCount([])).toBe(0)
  })

  it('sums line prices from the catalog', () => {
    expect(subtotal(cart, catalog)).toBe(320)
  })

  it('skips unknown products when summing', () => {
    expect(subtotal([{ productId: 'ghost', quantity: 3 }], catalog)).toBe(0)
  })

  it('formats whole-dollar USD', () => {
    expect(formatUsd(150)).toBe('$150')
    expect(formatUsd(1500)).toBe('$1,500')
  })
})

describe('parseCart', () => {
  it('accepts a well-formed stored cart', () => {
    expect(parseCart([{ productId: 'molty', quantity: 2 }], catalog)).toEqual([
      { productId: 'molty', quantity: 2 },
    ])
  })

  it.each([null, 'molty', 42, { productId: 'molty' }])('returns empty for %j', (raw) => {
    expect(parseCart(raw, catalog)).toEqual([])
  })

  it.each(['toString', '__proto__', 'constructor'])('rejects inherited key %s', (productId) => {
    expect(parseCart([{ productId, quantity: 1 }], catalog)).toEqual([])
  })

  it('drops unknown products and malformed lines and clamps quantities', () => {
    const raw = [
      { productId: 'ghost', quantity: 1 },
      { productId: 'molty', quantity: 'two' },
      { productId: 'stand', quantity: 99 },
    ]
    expect(parseCart(raw, catalog)).toEqual([{ productId: 'stand', quantity: MAX_QUANTITY }])
  })
})

describe('buildOrderMailto', () => {
  const cart: Cart = [{ productId: 'molty', quantity: 2 }]
  const href = buildOrderMailto(cart, catalog, 'jovian@molty.pet')
  const url = new URL(href)

  it('targets the order address', () => {
    expect(url.protocol).toBe('mailto:')
    expect(url.pathname).toBe('jovian@molty.pet')
  })

  it('puts the unit count in the subject', () => {
    expect(url.searchParams.get('subject')).toBe('Molty pre-order — 2 units')
  })

  it('lists lines, the total, and shipping fields in the body', () => {
    const body = url.searchParams.get('body') ?? ''
    expect(body).toContain('2 × Molty — $300')
    expect(body).toContain('Total: $300')
    expect(body).toContain('Shipping country:')
  })

  it('uses CRLF line breaks per RFC 6068', () => {
    expect(href).toContain('%0D%0A')
    expect(href).not.toMatch(/[^D]%0A/)
  })

  it('uses %20 rather than + for spaces so mail clients render them', () => {
    expect(href).not.toContain('+')
  })

  it('uses singular wording for one unit', () => {
    const one = new URL(buildOrderMailto([{ productId: 'molty', quantity: 1 }], catalog, 'a@b.co'))
    expect(one.searchParams.get('subject')).toBe('Molty pre-order — 1 unit')
  })
})
