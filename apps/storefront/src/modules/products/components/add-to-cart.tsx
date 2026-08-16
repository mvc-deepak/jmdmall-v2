'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@lib/hooks/useCart'
import { HttpTypes } from '@medusajs/types'

interface AddToCartProps {
  product: HttpTypes.StoreProduct
  onAddSuccess?: () => void
}

interface CartItem {
  variant_id: string
  quantity: number
}

export default function AddToCart({
  product,
  onAddSuccess,
}: AddToCartProps) {
  const { cart, addItem, updateQuantity, isLoading } = useCart()
  const [quantity, setQuantity] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  const variant = product.variants?.[0]
  if (!variant) return null

  // Initialize quantity from cart hook on mount and update when cart changes
  useEffect(() => {
    setIsMounted(true)
    const cartItem = cart?.items?.find((item: CartItem) => item.variant_id === variant.id)
    setQuantity(cartItem?.quantity || 0)
  }, [cart, variant.id])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variant) return

    await addItem({
      product_id: product.id,
      product_handle: product.handle,
      variant_id: variant.id,
      quantity: 1,
      title: product.title,
      sku: variant.sku,
      price: variant.calculated_price?.calculated_amount || 0,
      image: product.thumbnail,
      variant_title: variant.title && variant.title !== "Default Title" ? variant.title : undefined,
    })

    onAddSuccess?.()
  }

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await updateQuantity(variant.id, quantity + 1)
  }

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantity > 0) {
      await updateQuantity(variant.id, quantity - 1)
    }
  }

  if (!isMounted) {
    return (
      <button
        disabled
        className="inline-flex h-[38px] min-w-[86px] items-center justify-center rounded-[8px] border border-emerald-500 bg-white px-3 text-[13px] font-medium text-emerald-700"
      >
        ADD
      </button>
    )
  }

  if (quantity > 0) {
    return (
      <div className="inline-flex h-[38px] items-center gap-2 rounded-[8px] border border-emerald-500 bg-white px-2">
        <button
          onClick={handleDecrement}
          disabled={isLoading}
          className="flex items-center justify-center w-6 h-6 text-emerald-700 hover:bg-emerald-50 rounded disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-6 text-center font-medium text-emerald-700 text-sm">
          {quantity}
        </span>
        <button
          onClick={handleIncrement}
          disabled={isLoading}
          className="flex items-center justify-center w-6 h-6 text-emerald-700 hover:bg-emerald-50 rounded disabled:opacity-50"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className="inline-flex h-[38px] min-w-[86px] items-center justify-center rounded-[8px] border border-emerald-500 bg-white px-3 text-[13px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
    >
      {isLoading ? 'Adding...' : 'ADD'}
    </button>
  )
}
