"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CategoryCarouselProps {
  category: HttpTypes.StoreProductCategory
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function CategoryCarousel({ category, products, region }: CategoryCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = carouselRef.current
    if (!el) return

    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = carouselRef.current
    if (!el) return

    el.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)

    return () => {
      el.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [updateScrollState])

  const scrollBy = (direction: "left" | "right") => {
    const el = carouselRef.current
    if (!el) return

    const amount = el.clientWidth * 0.9
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" })
  }

  return (
    <div className="py-8 border-b last:border-b-0">
      <div className="content-container">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-ui-fg-base">{category.name}</h2>
          <LocalizedClientLink
            href={`/categories/${category.handle}`}
            className="text-sm text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
          >
            View all →
          </LocalizedClientLink>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[18px] border border-ui-border-base/10 bg-white shadow-sm">
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar px-4 py-4 snap-x snap-mandatory"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 snap-start"
                  style={{ width: "clamp(160px, calc((100% - 4rem) / 8), 190px)" }}
                >
                  <ProductPreview product={product} region={region} isFeatured={false} />
                </div>
              ))}
            </div>
          </div>

          {canScrollLeft && (
            <button
              onClick={() => scrollBy("left")}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ui-border-base/20 bg-white/95 p-2 shadow-sm transition hover:bg-white"
              aria-label={`Scroll ${category.name} products left`}
            >
              <svg
                className="h-5 w-5 text-ui-fg-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scrollBy("right")}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ui-border-base/20 bg-white/95 p-2 shadow-sm transition hover:bg-white"
              aria-label={`Scroll ${category.name} products right`}
            >
              <svg
                className="h-5 w-5 text-ui-fg-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
