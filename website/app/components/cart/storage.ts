import { parseCart, type Cart, type Catalog } from '@/app/lib/cart'

export const STORAGE_KEY = 'molty.cart.v1'

const EMPTY: Cart = []

export interface CartStore {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => Cart
  getServerSnapshot: () => Cart
  update: (next: (cart: Cart) => Cart) => void
}

function readStoredCart(catalog: Catalog): Cart {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? parseCart(JSON.parse(raw), catalog) : EMPTY
  } catch {
    // Corrupt JSON or blocked storage (private mode): start with an empty cart.
    return EMPTY
  }
}

function writeStoredCart(cart: Cart): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // Storage unavailable: the cart still works for this visit, it just won't persist.
  }
}

/**
 * A tiny localStorage-backed store for useSyncExternalStore. The server
 * snapshot is always empty so hydration matches; the stored cart loads lazily
 * on the client. Also follows edits made in other tabs.
 */
export function createCartStore(catalog: Catalog): CartStore {
  let cart: Cart | null = null
  const listeners = new Set<() => void>()
  const emit = () => listeners.forEach((listener) => listener())

  const onStorage = (event: StorageEvent) => {
    // key is null when another tab calls localStorage.clear().
    if (event.key !== null && event.key !== STORAGE_KEY) return
    cart = readStoredCart(catalog)
    emit()
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      if (listeners.size === 1) window.addEventListener('storage', onStorage)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) window.removeEventListener('storage', onStorage)
      }
    },
    getSnapshot() {
      if (cart === null) cart = readStoredCart(catalog)
      return cart
    },
    getServerSnapshot: () => EMPTY,
    update(next) {
      cart = next(cart ?? readStoredCart(catalog))
      writeStoredCart(cart)
      emit()
    },
  }
}
