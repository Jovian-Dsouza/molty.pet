/**
 * Pure, immutable cart helpers. Every function returns a new cart and never
 * touches its input, so they can back a React reducer directly.
 */

export const MAX_QUANTITY = 5

export interface Product {
  id: string
  name: string
  priceUsd: number
}

export type Catalog = Readonly<Record<string, Product>>

export interface CartLine {
  readonly productId: string
  readonly quantity: number
}

export type Cart = readonly CartLine[]

const clampQuantity = (quantity: number): number =>
  Math.min(MAX_QUANTITY, Math.max(1, Math.round(quantity)))

export function addItem(cart: Cart, productId: string, quantity = 1): Cart {
  const existing = cart.find((line) => line.productId === productId)
  if (!existing) {
    return [...cart, { productId, quantity: clampQuantity(quantity) }]
  }
  return setQuantity(cart, productId, existing.quantity + quantity)
}

export function setQuantity(cart: Cart, productId: string, quantity: number): Cart {
  return cart.map((line) =>
    line.productId === productId ? { ...line, quantity: clampQuantity(quantity) } : line,
  )
}

export function removeItem(cart: Cart, productId: string): Cart {
  return cart.filter((line) => line.productId !== productId)
}

export function itemCount(cart: Cart): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0)
}

/** Own-property lookup, so inherited keys like "toString" never match a product. */
export function findProduct(catalog: Catalog, productId: string): Product | undefined {
  return Object.hasOwn(catalog, productId) ? catalog[productId] : undefined
}

export function subtotal(cart: Cart, catalog: Catalog): number {
  return cart.reduce(
    (sum, line) => sum + (findProduct(catalog, line.productId)?.priceUsd ?? 0) * line.quantity,
    0,
  )
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** Validates untrusted stored data (e.g. localStorage) into a safe cart. */
export function parseCart(raw: unknown, catalog: Catalog): Cart {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((line: unknown): CartLine[] => {
    if (!isRecord(line)) return []
    const { productId, quantity } = line
    if (typeof productId !== 'string' || !findProduct(catalog, productId)) return []
    if (typeof quantity !== 'number' || !Number.isFinite(quantity)) return []
    return [{ productId, quantity: clampQuantity(quantity) }]
  })
}

const pluralUnits = (count: number): string => `${count} ${count === 1 ? 'unit' : 'units'}`

/**
 * Builds a mailto: link for a pre-order request. Uses encodeURIComponent so
 * spaces become %20 (some mail clients show "+" literally) and CRLF line
 * breaks, which RFC 6068 requires.
 */
export function buildOrderMailto(cart: Cart, catalog: Catalog, email: string): string {
  const lines = cart.flatMap((line) => {
    const product = findProduct(catalog, line.productId)
    if (!product) return []
    return [`${line.quantity} × ${product.name} — ${formatUsd(product.priceUsd * line.quantity)}`]
  })
  const subject = `Molty pre-order — ${pluralUnits(itemCount(cart))}`
  const body = [
    "Hi! I'd like to pre-order:",
    '',
    ...lines,
    '',
    `Total: ${formatUsd(subtotal(cart, catalog))} (no payment taken yet)`,
    '',
    'Name:',
    'Shipping country:',
    'Anything else:',
  ].join('\r\n')
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
