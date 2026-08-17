import { MedusaService } from "@medusajs/framework/utils"
import WishlistItem from "./models/wishlist-item"

class WishlistModuleService extends MedusaService({
  WishlistItem,
}) {
  async listWishlistItemsByCustomer(customerId: string) {
    return await (this as any).WishlistItem_.find({
      where: { customer_id: customerId },
      orderBy: { created_at: "DESC" },
    })
  }

  async addWishlistItemForCustomer(
    customerId: string,
    input: {
      product_id: string
      variant_id?: string | null
      product_handle?: string | null
      title: string
      thumbnail?: string | null
      price?: string | null
      metadata?: Record<string, any> | null
    }
  ) {
    const existing = await (this as any).WishlistItem_.findOne({
      where: { customer_id: customerId, product_id: input.product_id },
    })

    if (existing) {
      return existing
    }

    return await (this as any).WishlistItem_.create({
      customer_id: customerId,
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
      product_handle: input.product_handle ?? null,
      title: input.title,
      thumbnail: input.thumbnail ?? null,
      price: input.price ?? null,
      metadata: input.metadata ?? null,
    })
  }

  async removeWishlistItemForCustomer(
    customerId: string,
    itemId?: string,
    productId?: string
  ) {
    const where: Record<string, any> = { customer_id: customerId }

    if (itemId) {
      where.id = itemId
    }
    if (productId) {
      where.product_id = productId
    }

    const item = await (this as any).WishlistItem_.findOne({ where })

    if (!item) {
      return null
    }

    await (this as any).WishlistItem_.remove(item)
    return item
  }
}

export default WishlistModuleService
