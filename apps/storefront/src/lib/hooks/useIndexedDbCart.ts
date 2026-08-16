"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Cart, CartItem } from "@lib/types/cart"
import {
  getStoredCart,
  saveStoredCart,
  clearStoredCart,
  mergeGuestCart,
} from "@lib/data/indexed-db-cart"
import { HttpTypes } from "@medusajs/types"

const initialCart = (): Cart => ({
  cart_id: "active",
  items: [],
  total: 0,
  last_updated: Date.now(),
  is_guest: true,
})

export function useIndexedDbCart() {
  const [cart, setCart] = useState<Cart>(initialCart())
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const isMountedRef = useRef(false)

  const updateCart = useCallback(async (updated: Cart) => {
    await saveStoredCart(updated)
    setCart(updated)
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: updated }))
    return updated
  }, [])

  const createGuestCart = useCallback(async () => {
    const newCart = initialCart()
    return updateCart(newCart)
  }, [updateCart])

  const loadCart = useCallback(async () => {
    const stored = await getStoredCart()
    if (stored) {
      setCart(stored)
    } else {
      setCart(initialCart())
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

        return updateCart(currentCart)
      } finally {
        setIsLoading(false)
      }
    },
    [updateCart]
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

        return updateCart(currentCart)
      } finally {
        setIsLoading(false)
      }
    },
    [updateCart]
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

        return updateCart(currentCart)
      } finally {
        setIsLoading(false)
      }
    },
    [updateCart]
  )

  const clearCart = useCallback(async () => {
    setIsLoading(true)
    try {
      await clearStoredCart()
      const emptyCart = initialCart()
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
  }
}
