'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@lib/hooks/useCart'
import { HttpTypes } from '@medusajs/types'

interface ProductDetailPageProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  images: HttpTypes.StoreProductImage[]
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%239ca3af"%3EProduct Image%3C/text%3E%3C/svg%3E'

export default function ProductDetailPage({
  product,
  region,
  images,
}: ProductDetailPageProps) {
  const { cart, addItem, updateQuantity } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (product.variants?.[0]) {
      setSelectedVariantId(product.variants[0].id)
    }
  }, [product.variants])

  if (!isMounted) return null

  const variants = product.variants || []
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0]

  if (!selectedVariant) return null

  const mrp = selectedVariant.calculated_price?.original_amount || 0
  const sellingPrice = selectedVariant.calculated_price?.calculated_amount || 0
  const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0

  const cartItem = cart?.items.find((item) => item.variant_id === selectedVariantId)
  const quantity = cartItem?.quantity || 0

  const displayImages = images && images.length > 0 ? images : [{ id: '1', url: '' }]
  const currentImage = displayImages[selectedImageIndex]

  const handleAddToCart = async () => {
    if (quantity === 0) {
      await addItem(product.id, selectedVariantId, 1, {
        product_handle: product.handle,
        title: product.title,
        sku: selectedVariant.sku,
        price: sellingPrice,
        image: currentImage.url || PLACEHOLDER_IMAGE,
        variant_title:
          selectedVariant.title && selectedVariant.title !== 'Default Title'
            ? selectedVariant.title
            : undefined,
      })
    }
  }

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity >= 0) {
      await updateQuantity(selectedVariantId, newQuantity)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-0 py-2 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          {/* Image Gallery - Compact */}
          <div className="md:col-span-1 bg-gray-100 rounded-lg overflow-hidden">
            {/* Main Image */}
            <div className="relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden mb-2">
              <Image
                src={currentImage.url || PLACEHOLDER_IMAGE}
                alt="Product"
                fill
                className="object-cover"
                unoptimized={!currentImage.url}
              />
              {discount > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-1 px-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded overflow-hidden border-2 ${
                      selectedImageIndex === idx ? 'border-emerald-600' : 'border-gray-300'
                    }`}
                  >
                    <Image
                      src={img.url || PLACEHOLDER_IMAGE}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={!img.url}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details - Middle */}
          <div className="md:col-span-1 px-3 py-2">
            <h1 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
              {product.title}
            </h1>

            {/* Rating (placeholder) */}
            <div className="flex items-center gap-1 mb-2 text-xs">
              <span className="text-yellow-500">★★★★★</span>
              <span className="text-gray-600">(1.2K reviews)</span>
            </div>

            {/* Price Section - Compact */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600">
                  ₹{Math.round(sellingPrice)}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{Math.round(mrp)}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Inclusive of all taxes
              </div>
            </div>

            {/* Delivery Info - Compact */}
            <div className="text-xs text-gray-600 space-y-1 mb-3 pb-3 border-b border-gray-200">
              <div>✓ In stock - Fast delivery</div>
              {selectedVariant.sku && <div>SKU: {selectedVariant.sku}</div>}
            </div>

            {/* Variant Selection */}
            {variants.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">
                  Size / Variant
                </h3>
                <div className={`grid gap-1 ${variants.length > 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                  {variants.map((variant, idx) => {
                    const vMrp = variant.calculated_price?.original_amount || 0
                    const vPrice = variant.calculated_price?.calculated_amount || 0
                    const vDiscount = vMrp > vPrice ? Math.round(((vMrp - vPrice) / vMrp) * 100) : 0
                    const vQuantity =
                      cart?.items.find((item) => item.variant_id === variant.id)
                        ?.quantity || 0

                    const variantLabel =
                      variant.title && variant.title !== 'Default Title'
                        ? variant.title
                        : variant.sku || `Variant ${idx + 1}`

                    const sizeMatch = variantLabel.match(/(\d+\s*(?:kg|gm|ml|l))/i)
                    const size = sizeMatch ? sizeMatch[1] : null
                    const isNumericSize = /^[XS]{1,3}$|^[0-9]+$/.test(variantLabel)

                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`p-2 border rounded text-xs transition-all flex flex-col relative ${
                          selectedVariantId === variant.id
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {vDiscount > 0 && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                            {vDiscount}%
                          </div>
                        )}
                        {size ? (
                          <div className="font-bold text-gray-900">
                            {size}
                          </div>
                        ) : isNumericSize ? (
                          <div className="font-bold text-gray-900 text-sm">
                            {variantLabel}
                          </div>
                        ) : (
                          <div className="font-medium text-gray-900 line-clamp-1 text-xs">
                            {variantLabel}
                          </div>
                        )}
                        {!size && !isNumericSize && (
                          <div className="text-gray-600 text-xs">₹{Math.round(vPrice)}</div>
                        )}
                        {(size || isNumericSize) && (
                          <div className="text-gray-600 text-xs mt-0.5">₹{Math.round(vPrice)}</div>
                        )}
                        {vQuantity > 0 && (
                          <div className="text-emerald-600 font-semibold text-xs mt-0.5">
                            +{vQuantity}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions - Right */}
          <div className="md:col-span-1 bg-gray-50 rounded-lg p-3 h-fit sticky top-4">
            <div className="mb-3">
              {quantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center justify-between border-2 border-emerald-600 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(Math.max(0, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold text-emerald-600 hover:bg-emerald-50"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold text-emerald-600 hover:bg-emerald-50"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded p-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold">₹{Math.round(sellingPrice)}</span>
              </div>
              {quantity > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Qty</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-1 flex justify-between font-bold text-emerald-600">
                    <span>Total</span>
                    <span>₹{Math.round(sellingPrice * quantity)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 px-3 py-2 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">About this product</h3>
          <p className="text-sm text-gray-600 line-clamp-3">
            {product.description || 'No description available'}
          </p>
        </div>
      </div>
    </div>
  )
}
