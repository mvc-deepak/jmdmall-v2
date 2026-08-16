'use client'

import { useEffect, useState } from 'react'
import { useWishlist } from '@lib/hooks/useWishlist'
import { HttpTypes } from '@medusajs/types'

interface WishlistButtonProps {
  product: HttpTypes.StoreProduct
  className?: string
  size?: 'sm' | 'md'
}

export default function WishlistButton({ product, className = '', size = 'md' }: WishlistButtonProps) {
  const { addItem, removeItem, wishlist } = useWishlist()
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const saved = wishlist.some((item) => item.id === product.id)
    setIsSaved(saved)
  }, [product.id, wishlist])

  const handleToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const firstVariant = product.variants?.[0]
    const payload = {
      id: product.id,
      product_id: product.id,
      variant_id: firstVariant?.id || product.id,
      handle: product.handle,
      title: product.title,
      thumbnail: product.thumbnail,
      price: firstVariant?.calculated_price?.calculated_amount
        ? `₹${Math.round(firstVariant.calculated_price.calculated_amount)}`
        : undefined,
    }

    if (isSaved) {
      await removeItem(product.id)
      setIsSaved(false)
      return
    }

    await addItem(payload)
    setIsSaved(true)
  }

  const sizeClasses = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={[
        'inline-flex items-center justify-center rounded-full border transition-all duration-200',
        'bg-white/90 shadow-sm backdrop-blur-sm',
        isSaved ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600',
        sizeClasses,
        className,
      ].join(' ')}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        width={size === 'sm' ? 16 : 18}
        height={size === 'sm' ? 16 : 18}
        aria-hidden="true"
      >
        <path d="M12 21s-7.5-4.35-10.5-9.35C.52 9.7 2.05 5 6.1 5c2.18 0 3.42 1.13 4.12 2.2C10.92 6.13 12.16 5 14.34 5c4.05 0 5.58 4.7 4.6 6.65C19.5 16.65 12 21 12 21Z" />
      </svg>
    </button>
  )
}
