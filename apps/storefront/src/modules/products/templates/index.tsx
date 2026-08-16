import React, { Suspense } from "react"
import ProductDetailPage from "@modules/products/components/product-detail-page"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

async function getRelatedProducts(product: HttpTypes.StoreProduct, region: HttpTypes.StoreRegion, countryCode: string) {
  try {
    const queryParams: HttpTypes.StoreProductListParams = {}
    if (region?.id) {
      queryParams.region_id = region.id
    }
    if (product.collection_id) {
      queryParams.collection_id = [product.collection_id]
    }
    if (product.tags) {
      queryParams.tag_id = product.tags.map((t) => t.id).filter(Boolean) as string[]
    }
    queryParams.is_giftcard = false

    const { response } = await listProducts({
      queryParams,
      countryCode,
    })

    return response.products || []
  } catch (error) {
    console.error("Failed to fetch related products:", error)
    return []
  }
}

const ProductTemplate: React.FC<ProductTemplateProps> = async ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const relatedProducts = await getRelatedProducts(product, region, countryCode)

  return (
    <>
      <ProductDetailPage product={product} region={region} images={images} />

      {relatedProducts.length > 0 && (
        <div className="content-container my-8 md:my-16">
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts
              products={relatedProducts}
              region={region}
              currentProductId={product.id}
            />
          </Suspense>
        </div>
      )}
    </>
  )
}

export default ProductTemplate
