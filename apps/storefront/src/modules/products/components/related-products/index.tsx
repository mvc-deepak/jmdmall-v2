'use client'

import { useState } from 'react'
import { HttpTypes } from '@medusajs/types'
import Product from '../product-preview'

type RelatedProductsProps = {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  currentProductId: string
}

export default function RelatedProducts({
  products,
  region,
  currentProductId,
}: RelatedProductsProps) {
  const [scrollPosition, setScrollPosition] = useState(0)

  const filteredProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 12)

  if (!filteredProducts.length) {
    return null
  }

  const itemWidth = 16.66 // 6.5 items per row = 100/6.5 ≈ 15.38, use 16.66 for safe spacing
  const maxScroll = Math.max(0, (filteredProducts.length - 6.5) * (100 / 6.5))

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = 100
    const newPosition = direction === 'right' ? scrollPosition + scrollAmount : Math.max(0, scrollPosition - scrollAmount)
    setScrollPosition(Math.min(newPosition, maxScroll))
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center mb-6">
        <span className="text-sm text-gray-600 mb-2">
          Related products
        </span>
        <p className="text-xl font-bold text-gray-900 max-w-lg">
          You might also want to check out these products.
        </p>
      </div>

      <div className="relative">
        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${scrollPosition}%)`,
            }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{ width: `${itemWidth}%`, paddingRight: '0.5rem' }}
              >
                <Product region={region} product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Left Arrow */}
        {scrollPosition > 0 && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Scroll left"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Arrow */}
        {scrollPosition < maxScroll && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Scroll right"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Scroll Indicator */}
      {maxScroll > 0 && (
        <div className="text-center text-xs text-gray-500 mt-4">
          Scroll to see more
        </div>
      )}
    </div>
  )
}
