import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <section className="content-container py-10 md:py-16">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Text className="text-2xl font-bold tracking-tight text-slate-900">
          {collection.title}
        </Text>
        <InteractiveLink href={`/collections/${collection.handle}`} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          View all
        </InteractiveLink>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </section>
  )
}
