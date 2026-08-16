import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

const getCategoryImage = (category: HttpTypes.StoreProductCategory) => {
  const categoryData = category as Record<string, unknown>
  const metadata = (categoryData.metadata as Record<string, unknown> | undefined) ?? {}

  const candidates = [
    categoryData.image,
    categoryData.image_url,
    categoryData.thumbnail,
    categoryData.category_image,
    metadata.image,
    metadata.image_url,
    metadata.thumbnail,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate) {
      return candidate
    }

    if (
      candidate &&
      typeof candidate === "object" &&
      "url" in candidate &&
      typeof (candidate as { url?: string }).url === "string"
    ) {
      return (candidate as { url: string }).url
    }
  }

  return undefined
}

export default function MainCategories({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  if (!categories.length) {
    return null
  }

  const topLevelCategories = categories.filter((category) => !category.parent_category)

  return (
    <section className="py-6 w-full">
      <div className="px-6 mx-auto flex flex-col gap-y-3">
        <span className="txt-small-plus txt-ui-fg-base px-0">
          Categories
        </span>
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 text-ui-fg-subtle txt-small">
          {topLevelCategories.map((category) => {
            const image = getCategoryImage(category)

            return (
              <li key={category.id} className="list-none">
                <LocalizedClientLink
                  href={`/categories/${category.handle}`}
                  className="group flex flex-col items-center text-center gap-2 transition duration-200"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-ui-border-base/10 bg-ui-bg-subtle transition-colors duration-200 group-hover:bg-ui-bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt={category.name || "Category"}
                        fill
                        className="object-cover object-center transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ui-fg-subtle">
                        <PlaceholderImage size={24} />
                      </div>
                    )}
                  </div>

                  <span className="txt-small text-ui-fg-base max-w-full line-clamp-2 text-center hover:text-ui-fg-base">
                    {category.name}
                  </span>
                </LocalizedClientLink>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}