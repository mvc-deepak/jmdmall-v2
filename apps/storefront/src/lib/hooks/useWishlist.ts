import { useCallback, useEffect, useState } from 'react'
import {
  addToStoredWishlist,
  getStoredWishlist,
  isStoredWishlistItem,
  removeFromStoredWishlist,
  type WishlistItem,
} from '@lib/data/indexed-db-wishlist'

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const items = await getStoredWishlist()
      setWishlist(items)
    } catch {
      setWishlist([])
    } finally {
      setIsLoaded(true)
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
    setWishlist(items)
    window.dispatchEvent(new CustomEvent('wishlistUpdated'))
    return items
  }, [])

  const removeItem = useCallback(async (id: string) => {
    const items = await removeFromStoredWishlist(id)
    setWishlist(items)
    window.dispatchEvent(new CustomEvent('wishlistUpdated'))
    return items
  }, [])

  const toggleItem = useCallback(async (item: WishlistItem) => {
    const exists = wishlist.some((current) => current.id === item.id)

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
    toggleItem,
    isItemSaved,
    refresh,
  }
}
