"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Cart, CartItem } from "@lib/types/cart"
import {
  getStoredCart,
  saveStoredCart,
  clearStoredCart,
  mergeGuestCart,
} from "@lib/data/indexed-db-cart"
import { setLocalGuestCartCookie } from "@lib/data/local-cart-cookie"
import { HttpTypes } from "@medusajs/types"

const initialCart = (): Cart => ({
  cart_id: "active",
  items: [],
  total: 0,
  last_updated: Date.now(),
  is_guest: true,
})

const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await fetch("/store/customers/me", {
      cache: "no-store",
      credentials: "include",
    })
    return response.ok
  } catch {
    return false
  }
}

const fetchServerCart = async (): Promise<any | null> => {
  try {
    const response = await fetch("/store/carts", { cache: "no-store" })
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data?.cart ?? data ?? null
  } catch {
    return null
  }
}

const addServerCartItem = async (item: CartItem) => {
  try {
    const serverCart = await fetchServerCart()
    if (!serverCart?.id) {
      return null
    }

    const response = await fetch(`/store/carts/${serverCart.id}/line-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variant_id: item.variant_id,
        quantity: item.quantity,
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

const updateServerCartItem = async (variantId: string, quantity: number) => {
  try {
    const serverCart = await fetchServerCart()
    if (!serverCart?.id || !Array.isArray(serverCart.items)) {
      return null
    }

    const lineItem = serverCart.items.find(
      (entry: any) => entry.variant_id === variantId || entry.id === variantId
    )

    if (!lineItem?.id) {
      return null
    }

    const response = await fetch(`/store/carts/${serverCart.id}/line-items/${lineItem.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  }
}

const removeServerCartItem = async (variantId: string) => {
  try {
    const serverCart = await fetchServerCart()
    if (!serverCart?.id || !Array.isArray(serverCart.items)) {
      return null
    }

    const lineItem = serverCart.items.find(
      (entry: any) => entry.variant_id === variantId || entry.id === variantId
    )

    if (!lineItem?.id) {
      return null
    }

    const response = await fetch(`/store/carts/${serverCart.id}/line-items/${lineItem.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  }
}

const clearServerCart = async () => {
  try {
    const serverCart = await fetchServerCart()
    if (!serverCart?.id || !Array.isArray(serverCart.items)) {
      return null
    }

    for (const lineItem of serverCart.items) {
      if (lineItem?.id) {
        await fetch(`/store/carts/${serverCart.id}/line-items/${lineItem.id}`, {
          method: "DELETE",
        })
      }
    }

    return serverCart
  } catch {
    return null
  }
}

export function useIndexedDbCart() {
  const [cart, setCart] = useState<Cart>(initialCart())
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const isMountedRef = useRef(false)

  const persistLocalCart = useCallback(async (updated: Cart) => {
    await saveStoredCart(updated)
    setLocalGuestCartCookie(updated)
    setCart(updated)
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: updated }))
    return updated
  }, [])

  const syncFromServer = useCallback(async () => {
    try {
      const response = await fetch("/store/carts", {
        cache: "no-store",
      })

      const localCart = (await getStoredCart()) || initialCart()

      if (!response.ok) {
        setCart(localCart)
        setLocalGuestCartCookie(localCart)
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: localCart }))
        return localCart
      }

      const data = await response.json()
      const serverCart = data?.cart ?? data ?? { ...initialCart(), items: [] }
      const merged = await mergeGuestCart(localCart, serverCart)

      await saveStoredCart(merged)
      setLocalGuestCartCookie(merged)
      setCart(merged)
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: merged }))
      return merged
    } catch (error) {
      console.error("Failed to sync cart from server", error)
      const local = (await getStoredCart()) || initialCart()
      setCart(local)
      setLocalGuestCartCookie(local)
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: local }))
      return local
    }
  }, [])

  const updateCart = useCallback(async (updated: Cart) => {
    return persistLocalCart(updated)
  }, [persistLocalCart])

  const createGuestCart = useCallback(async () => {
    const newCart = initialCart()
    return updateCart(newCart)
  }, [updateCart])

  const loadCart = useCallback(async () => {
    const stored = await getStoredCart()
    if (stored) {
      setLocalGuestCartCookie(stored)
      setCart(stored)
    } else {
      const emptyCart = initialCart()
      setLocalGuestCartCookie(emptyCart)
      setCart(emptyCart)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isMountedRef.current) {
      return
    }
    isMountedRef.current = true
    loadCart().catch((error) => {
      console.error("Failed to load cart from IndexedDB", error)
      setCart(initialCart())
      setIsLoading(false)
    })
  }, [loadCart])

  useEffect(() => {
    const handleCartUpdated = (event: Event) => {
      const nextCart = (event as CustomEvent<Cart>).detail
      if (nextCart) {
        setCart(nextCart)
        setIsLoading(false)
      }
    }

    const handleStorageUpdated = () => {
      loadCart().catch((error) => {
        console.error("Failed to refresh cart from IndexedDB", error)
      })
    }

    window.addEventListener("cartUpdated", handleCartUpdated)
    window.addEventListener("storage", handleStorageUpdated)

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated)
      window.removeEventListener("storage", handleStorageUpdated)
    }
  }, [loadCart])

  const addItem = useCallback(
    async (...args: any[]) => {
      setIsLoading(true)
      try {
        // Support two signatures:
        // addItem(item: CartItem)
        // addItem(productId: string, variantId: string, quantity: number, meta: Partial<CartItem>)
        let item: CartItem

        if (args.length === 1 && typeof args[0] === 'object') {
          item = args[0]
        } else {
          const [product_id, variant_id, quantity, meta] = args
          item = {
            product_id,
            variant_id,
            product_handle: meta?.product_handle || meta?.handle,
            quantity: quantity || 1,
            title: meta?.title || '',
            price: meta?.price || 0,
            image: meta?.image,
            sku: meta?.sku,
            variant_title: meta?.variant_title,
          }
        }

        const currentCart = (await getStoredCart()) || initialCart()
        const existingIndex = currentCart.items.findIndex(
          (existing) =>
            existing.product_id === item.product_id &&
            existing.variant_id === item.variant_id
        )

        if (existingIndex >= 0) {
          currentCart.items[existingIndex].quantity += item.quantity
        } else {
          currentCart.items.push(item)
        }

        currentCart.total = currentCart.items.reduce(
          (sum, cartItem) => sum + cartItem.price * cartItem.quantity,
          0
        )
        currentCart.last_updated = Date.now()
        currentCart.is_guest = currentCart.is_guest ?? true

        const localUpdated = await updateCart(currentCart)

        if (await isAuthenticated()) {
          try {
            await addServerCartItem(item)
            return await syncFromServer()
          } catch {
            return localUpdated
          }
        }

        return localUpdated
      } finally {
        setIsLoading(false)
      }
    },
    [syncFromServer, updateCart]
  )

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      setIsLoading(true)
      try {
        const currentCart = await getStoredCart()
        if (!currentCart) {
          return null
        }

        const item = currentCart.items.find((i) => i.variant_id === variantId)
        if (!item) return currentCart

        if (quantity <= 0) {
          currentCart.items = currentCart.items.filter((i) => i.variant_id !== variantId)
        } else {
          item.quantity = quantity
        }

        currentCart.total = currentCart.items.reduce(
          (sum, cartItem) => sum + cartItem.price * cartItem.quantity,
          0
        )
        currentCart.last_updated = Date.now()

        const localUpdated = await updateCart(currentCart)

        if (await isAuthenticated()) {
          try {
            await updateServerCartItem(variantId, quantity)
            return await syncFromServer()
          } catch {
            return localUpdated
          }
        }

        return localUpdated
      } finally {
        setIsLoading(false)
      }
    },
    [syncFromServer, updateCart]
  )

  const removeItem = useCallback(
    async (variantId: string) => {
      setIsLoading(true)
      try {
        const currentCart = await getStoredCart()
        if (!currentCart) return null

        currentCart.items = currentCart.items.filter((i) => i.variant_id !== variantId)
        currentCart.total = currentCart.items.reduce(
          (sum, cartItem) => sum + cartItem.price * cartItem.quantity,
          0
        )
        currentCart.last_updated = Date.now()

        const localUpdated = await updateCart(currentCart)

        if (await isAuthenticated()) {
          try {
            await removeServerCartItem(variantId)
            return await syncFromServer()
          } catch {
            return localUpdated
          }
        }

        return localUpdated
      } finally {
        setIsLoading(false)
      }
    },
    [syncFromServer, updateCart]
  )

  const clearCart = useCallback(async () => {
    setIsLoading(true)
    try {
      if (await isAuthenticated()) {
        try {
          await clearServerCart()
        } catch {
          // Ignore server-side clear failures and keep the local cart clear.
        }
      }

      await clearStoredCart()
      const emptyCart = initialCart()
      setLocalGuestCartCookie(null)
      setCart(emptyCart)
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: emptyCart }))
      return emptyCart
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setCartFromServer = useCallback(
    async (serverCart: Cart) => {
      setIsSyncing(true)
      try {
        const merged = await mergeGuestCart(cart, serverCart)
        return updateCart(merged)
      } finally {
        setIsSyncing(false)
      }
    },
    [cart, updateCart]
  )

  return {
    cart,
    isLoading,
    isSyncing,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setCartFromServer,
    syncFromServer,
  }
}
