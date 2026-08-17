import { useCallback, useEffect, useState } from 'react'
import {
  addToStoredWishlist,
  clearStoredWishlist,
  getStoredWishlist,
  isStoredWishlistItem,
  removeFromStoredWishlist,
  saveStoredWishlist,
  type WishlistItem,
} from '@lib/data/indexed-db-wishlist'

const mergeWishlistItems = (items: WishlistItem[]) => {
  const map = new Map<string, WishlistItem>()

  items.forEach((item) => {
    const key = item.product_id || item.id
    const current = map.get(key)

    map.set(key, {
      ...current,
      ...item,
      id: item.id || current?.id || key,
      product_id: item.product_id || current?.product_id,
      variant_id: item.variant_id || current?.variant_id,
    })
  })

  return Array.from(map.values())
}

const fetchServerWishlist = async (): Promise<WishlistItem[]> => {
  try {
    const response = await fetch('/store/wishlist', { cache: 'no-store' })
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return Array.isArray(data.items) ? data.items : []
  } catch {
    return []
  }
}

const addServerWishlistItem = async (item: WishlistItem) => {
  try {
    const response = await fetch('/store/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: item.product_id || item.id,
        variant_id: item.variant_id || null,
        product_handle: item.handle,
        title: item.title,
        thumbnail: item.thumbnail || null,
        price: item.price || null,
      }),
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  }
}

const removeServerWishlistItem = async (item: WishlistItem) => {
  try {
    const query = item.product_id ? `?product_id=${encodeURIComponent(item.product_id)}` : `?item_id=${encodeURIComponent(item.id)}`
    const response = await fetch(`/store/wishlist${query}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  }
}

const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await fetch('/store/customers/me', {
      cache: 'no-store',
      credentials: 'include',
    })
    return response.ok
  } catch {
    return false
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const localItems = await getStoredWishlist()
      const serverItems = await fetchServerWishlist()
      const merged = mergeWishlistItems([...serverItems, ...localItems])

      await saveStoredWishlist(merged)
      setWishlist(merged)
    } catch {
      const fallback = await getStoredWishlist().catch(() => [])
      setWishlist(fallback)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const syncFromServer = useCallback(async () => {
    try {
      const serverItems = await fetchServerWishlist()
      const localItems = await getStoredWishlist()
      const merged = mergeWishlistItems([...serverItems, ...localItems])

      await saveStoredWishlist(merged)
      setWishlist(merged)
      window.dispatchEvent(new CustomEvent('wishlistUpdated'))
      return merged
    } catch {
      const localItems = await getStoredWishlist().catch(() => [])
      setWishlist(localItems)
      window.dispatchEvent(new CustomEvent('wishlistUpdated'))
      return localItems
    }
  }, [])

  useEffect(() => {
    refresh()

    const handleStorage = () => refresh()
    const handleWishlistUpdated = () => refresh()

    window.addEventListener('storage', handleStorage)
    window.addEventListener('wishlistUpdated', handleWishlistUpdated)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('wishlistUpdated', handleWishlistUpdated)
    }
  }, [refresh])

  const addItem = useCallback(async (item: WishlistItem) => {
    const items = await addToStoredWishlist(item)
    const merged = mergeWishlistItems(items)
    setWishlist(merged)

    if (await isAuthenticated()) {
      await addServerWishlistItem(item)
    }

    window.dispatchEvent(new CustomEvent('wishlistUpdated'))
    return merged
  }, [])

  const removeItem = useCallback(async (id: string) => {
    const localItems = await getStoredWishlist()
    const target = localItems.find((current) => current.id === id || current.product_id === id)

    const items = await removeFromStoredWishlist(id)
    const merged = mergeWishlistItems(items)
    setWishlist(merged)

    if (target && (await isAuthenticated())) {
      await removeServerWishlistItem(target)
    }

    window.dispatchEvent(new CustomEvent('wishlistUpdated'))
    return merged
  }, [])

  const clearWishlist = useCallback(async () => {
    await clearStoredWishlist()
    setWishlist([])
    window.dispatchEvent(new CustomEvent('wishlistUpdated'))
  }, [])

  const toggleItem = useCallback(async (item: WishlistItem) => {
    const exists = wishlist.some((current) => current.id === item.id || current.product_id === item.product_id)

    if (exists) {
      await removeItem(item.id)
      return false
    }

    await addItem(item)
    return true
  }, [addItem, removeItem, wishlist])

  const isItemSaved = useCallback(async (id: string) => {
    return isStoredWishlistItem(id)
  }, [])

  return {
    wishlist,
    isLoaded,
    addItem,
    removeItem,
    clearWishlist,
    toggleItem,
    isItemSaved,
    refresh,
    syncFromServer,
  }
}
