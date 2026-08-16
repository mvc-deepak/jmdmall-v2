import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
  searchQuery,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  searchQuery?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="w-full max-w-full px-6 py-6" data-testid="category-container">
      <div className="mb-8 text-2xl-semi">
        <h1 data-testid="store-page-title">
          {searchQuery ? `Search results for "${searchQuery}"` : "All products"}
        </h1>
      </div>
      <RefinementList sortBy={sort} />
      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          countryCode={countryCode}
          optionValueIds={optionValueIds}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  )
}

export default StoreTemplate
