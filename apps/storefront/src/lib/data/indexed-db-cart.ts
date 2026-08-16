import { Cart, CartItem } from "@lib/types/cart"

const DB_NAME = "jmdmall_cart"
const DB_VERSION = 1
const STORE_NAME = "cart"

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "cart_id" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const withStore = async <T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>) => {
  const db = await getDB()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const store = tx.objectStore(STORE_NAME)
    const request = callback(store)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const getStoredCart = async (): Promise<Cart | null> => {
  return withStore<Cart | null>("readonly", (store) => store.get("active"))
}

export const saveStoredCart = async (cart: Cart): Promise<Cart> => {
  const stored = { ...cart, cart_id: "active" }
  await withStore<IDBValidKey>("readwrite", (store) => store.put(stored))
  return stored
}

export const clearStoredCart = async (): Promise<void> => {
  await withStore<IDBValidKey>("readwrite", (store) => store.delete("active"))
}

export const updateStoredCartItems = async (items: CartItem[], cart: Cart): Promise<Cart> => {
  const updatedCart = { ...cart, items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) }
  return saveStoredCart(updatedCart)
}

export const mergeGuestCart = async (guestCart: Cart, serverCart: Cart): Promise<Cart> => {
  const mergedItems: Record<string, CartItem> = {}

  const addItem = (item: CartItem) => {
    const key = `${item.product_id}_${item.variant_id}`
    if (!mergedItems[key]) {
      mergedItems[key] = { ...item }
    } else {
      mergedItems[key].quantity += item.quantity
    }
  }

  guestCart.items.forEach(addItem)
  serverCart.items.forEach(addItem)

  return {
    ...serverCart,
    items: Object.values(mergedItems),
    total: Object.values(mergedItems).reduce((sum, item) => sum + item.price * item.quantity, 0),
    last_updated: Date.now(),
    is_guest: false,
  }
}
