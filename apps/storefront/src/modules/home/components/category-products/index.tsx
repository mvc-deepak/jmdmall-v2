import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import CategoryCarousel from "./category-carousel"

export default async function CategoryProducts({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const allCategories = await listCategories({ limit: 100 })
  const categories = (allCategories || []).filter(
    (category) => !category.parent_category
  )

  if (!categories || categories.length < 2) {
    return null
  }

  const targetCategories = categories.filter((cat) =>
    ["Rice & Grains", "Cooking Oils & Ghee"].includes(cat.name)
  )

  const categoryProducts = await Promise.all(
    targetCategories.map(async (category) => {
      try {
        const {
          response: { products: pricedProducts },
        } = await listProducts({
          regionId: region.id,
          queryParams: {
            category_id: category.id,
            fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,",
            limit: 20,
          },
        })

        return {
          category,
          products: (pricedProducts || []).slice(0, 20),
        }
      } catch (error) {
        console.error(`Error fetching products for category ${category.name}:`, error)
        return {
          category,
          products: [],
        }
      }
    })
  )

  return (
    <div className="w-full">
      {categoryProducts.map(({ category, products }) => {
        if (!products || products.length === 0) {
          return null
        }

        return (
          <CategoryCarousel
            key={category.id}
            category={category}
            products={products}
            region={region}
          />
        )
      })}
    </div>
  )
}
