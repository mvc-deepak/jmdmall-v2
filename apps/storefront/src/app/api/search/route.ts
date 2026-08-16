import { NextResponse } from "next/server"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getProductPrice } from "@lib/util/get-product-price"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get("q")?.trim() || ""

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] })
  }

  const defaultCountryCode =
    process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

  const region = await getRegion(defaultCountryCode)

  if (!region) {
    return NextResponse.json({ products: [] })
  }

  const { response } = await listProducts({
    countryCode: defaultCountryCode,
    queryParams: {
      limit: 100,
      fields:
        "title,handle,thumbnail,variants.calculated_price,variants.images,variants.options",
    },
  })

  const lowerQuery = query.toLowerCase()

  const matchedProducts = response.products
    .filter((product) => Boolean(product.handle))
    .filter((product) => {
      if (product.title?.toLowerCase().includes(lowerQuery)) {
        return true
      }

      if (product.handle?.toLowerCase().includes(lowerQuery)) {
        return true
      }

      if (
        product.variants?.some(
          (variant) =>
            variant.title?.toLowerCase().includes(lowerQuery) ||
            variant.options?.some((option) =>
              option.value?.toLowerCase().includes(lowerQuery)
            )
        )
      ) {
        return true
      }

      if (
        product.options?.some((option) =>
          option.values?.some((value) => value?.value?.toLowerCase().includes(lowerQuery))
        )
      ) {
        return true
      }

      return false
    })

  const products = matchedProducts.slice(0, 8).map((product) => {
    const price = getProductPrice({ product })
    const variant = product.variants?.[0]
    const variantLabel =
      product.options?.length
        ? product.options
            .map((option) => option.values?.[0]?.value)
            .filter(Boolean)
            .join(" / ")
        : variant?.options
            ?.map((option) => option.value)
            .filter(Boolean)
            .join(" / ") ||
          (variant?.title && variant.title !== "Default Title"
            ? variant.title
            : undefined)

    return {
      id: product.id,
      title: product.title || product.handle || "Untitled product",
      handle: product.handle || "",
      thumbnail: product.thumbnail || product.images?.[0]?.url || null,
      variant: variantLabel || null,
      price: price?.cheapestPrice?.calculated_price ?? "",
      originalPrice: price?.cheapestPrice?.original_price ?? null,
    }
  })

  return NextResponse.json({ products })
}
