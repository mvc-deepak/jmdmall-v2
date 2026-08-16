export interface WishlistItem {
  id: string
  product_id?: string
  variant_id?: string
  handle: string
  title: string
  thumbnail?: string | null
  price?: string | null
}

interface WishlistRecord {
  id: 'items'
  items: WishlistItem[]
}

const DB_NAME = 'jmdmall_wishlist'
const DB_VERSION = 1
const STORE_NAME = 'wishlist'

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
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

export const getStoredWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const result = await withStore<WishlistRecord | undefined>('readonly', (store) => store.get('items'))
    return result?.items || []
  } catch {
    return []
  }
}

export const saveStoredWishlist = async (items: WishlistItem[]): Promise<WishlistItem[]> => {
  await withStore<IDBValidKey>('readwrite', (store) => store.put({ id: 'items', items }))
  return items
}

export const addToStoredWishlist = async (item: WishlistItem): Promise<WishlistItem[]> => {
  const current = await getStoredWishlist()
  const next = current.some((existing) => existing.id === item.id)
    ? current
    : [item, ...current]

  return saveStoredWishlist(next)
}

export const removeFromStoredWishlist = async (id: string): Promise<WishlistItem[]> => {
  const current = await getStoredWishlist()
  const next = current.filter((item) => item.id !== id)
  return saveStoredWishlist(next)
}

export const isStoredWishlistItem = async (id: string): Promise<boolean> => {
  const current = await getStoredWishlist()
  return current.some((item) => item.id === id)
}

export const clearStoredWishlist = async (): Promise<void> => {
  try {
    await withStore<IDBValidKey>('readwrite', (store) => store.delete('items'))
  } catch {
    // no-op
  }
}
