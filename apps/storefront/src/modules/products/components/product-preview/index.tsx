'use client'

import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import AddToCart from "../add-to-cart"
import WishlistButton from "@modules/wishlist/components/wishlist-button"

export default function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const deliveryLabel = (() => {
    const metadata = product.metadata as Record<string, unknown> | undefined

    if (typeof metadata?.delivery_time === "string") {
      return metadata.delivery_time
    }

    if (typeof metadata?.deliveryEstimate === "string") {
      return metadata.deliveryEstimate
    }

    return "Fast delivery"
  })()

  const variantLabel = (() => {
    if (product.options?.length) {
      const optionValues = product.options
        .map((option) => option.values?.[0]?.value)
        .filter((value): value is string => !!value)

      if (optionValues.length) {
        return optionValues.join(" / ")
      }
    }

    const firstVariant = product.variants?.[0]

    if (firstVariant) {
      const optionValues = firstVariant.options
        ?.map((option) => option.value)
        .filter((value): value is string => !!value)

      if (optionValues?.length) {
        return optionValues.join(" / ")
      }

      if (firstVariant.title && firstVariant.title !== "Default Title") {
        return firstVariant.title
      }
    }

    return undefined
  })()

  const variantCountLabel =
    product.variants && product.variants.length > 1
      ? `${product.variants.length} options`
      : undefined

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (!cheapestPrice) return null

    const sellingPrice = cheapestPrice.calculated_price_number || 0
    const mrpPrice = cheapestPrice.original_price_number || 0

    if (mrpPrice <= sellingPrice) return null

    const discountPercentage = Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)
    return discountPercentage > 0 ? discountPercentage : null
  }

  const discount = calculateDiscount()

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full w-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
        <div className="relative overflow-hidden bg-[#faf8ef]">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="!h-[200px] !p-1"
          />
          <div className="absolute right-2 top-2 z-10">
            <WishlistButton product={product} size="sm" />
          </div>
          {discount && (
            <div className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {discount}% OFF
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 px-3 py-3">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#f7f0e2] px-2.5 py-1 text-[10px] font-medium text-[#5f4d28]">
            <span aria-hidden="true">🕐</span>
            <span>{deliveryLabel}</span>
          </span>

          <Text
            className="line-clamp-2 text-[15px] font-medium leading-5 text-slate-900"
            data-testid="product-title"
          >
            {product.title}
          </Text>

          {variantLabel && (
            <Text className="text-[13px] leading-5 text-slate-500">
              {variantLabel}
            </Text>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <Text className="text-[15px] font-bold text-emerald-600">
                {cheapestPrice?.calculated_price || "Price unavailable"}
              </Text>
              {cheapestPrice?.original_price && cheapestPrice.original_price !== cheapestPrice.calculated_price && (
                <Text className="text-[12px] text-slate-400 line-through">
                  {cheapestPrice.original_price}
                </Text>
              )}
            </div>

            {variantCountLabel && (
              <Text className="text-[11px] text-slate-500">
                {variantCountLabel}
              </Text>
            )}

            <div className="flex justify-end pt-1" onClick={(e) => e.stopPropagation()}>
              <AddToCart product={product} />
            </div>
          </div>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
