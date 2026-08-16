'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@lib/hooks/useCart'
import { HttpTypes } from '@medusajs/types'

interface ProductDetailActionsProps {
  product: HttpTypes.StoreProduct
}

export default function ProductDetailActions({
  product,
}: ProductDetailActionsProps) {
  const { cart, addItem, updateQuantity } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Select first variant by default
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
  const discount =
    mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0

  const cartItem = cart?.items.find((item) => item.variant_id === selectedVariantId)
  const quantity = cartItem?.quantity || 0

  const handleAddToCart = async () => {
    if (quantity === 0) {
      await addItem(product.id, selectedVariantId, 1, {
        product_handle: product.handle,
        title: product.title,
        sku: selectedVariant.sku,
        price: sellingPrice,
        image: product.thumbnail,
        variant_title:
          selectedVariant.title && selectedVariant.title !== 'Default Title'
            ? selectedVariant.title
            : undefined,
      })
    }
  }

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove from cart
      // Implementation would need removeItem function
    } else {
      await updateQuantity(selectedVariantId, newQuantity)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
      {/* Variants */}
      {variants.length > 1 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Select Variant
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {variants.map((variant) => {
              const vMrp = variant.calculated_price?.original_amount || 0
              const vPrice = variant.calculated_price?.calculated_amount || 0
              const vDiscount =
                vMrp > vPrice ? Math.round(((vMrp - vPrice) / vMrp) * 100) : 0
              const vQuantity = cart?.items.find(
                (item) => item.variant_id === variant.id
              )?.quantity || 0

              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`p-3 border rounded-lg transition-all text-left ${
                    selectedVariantId === variant.id
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-900">
                    {variant.title && variant.title !== 'Default Title'
                      ? variant.title
                      : 'Standard'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    ₹{Math.round(vPrice)}
                  </div>
                  {vQuantity > 0 && (
                    <div className="text-xs text-emerald-600 font-semibold mt-1">
                      In Cart: {vQuantity}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity Controls / Add to Cart */}
      <div className="mb-6">
        {quantity === 0 ? (
          <button
            onClick={handleAddToCart}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between border border-gray-300 rounded-lg p-3">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-lg font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              −
            </button>
            <span className="text-lg font-bold text-gray-900">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-lg font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Selected Variant Details */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        {selectedVariant.title && selectedVariant.title !== 'Default Title' && (
          <div className="text-sm text-gray-600 mb-2">{selectedVariant.title}</div>
        )}

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-emerald-600">
            ₹{Math.round(sellingPrice)}
          </span>
          {mrp > sellingPrice && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ₹{Math.round(mrp)}
              </span>
              <span className="text-sm font-semibold text-red-600">
                {discount}% OFF
              </span>
            </>
          )}
        </div>

        <div className="text-xs text-gray-500">
          (Inclusive of all taxes)
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-600 space-y-2">
        <div>✓ In stock</div>
        <div>✓ Fast delivery available</div>
        {selectedVariant.sku && <div>SKU: {selectedVariant.sku}</div>}
      </div>
    </div>
  )
}
src/modules/products/components/add-to-cart.tsx 