import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const actor = (req.scope.resolve("actor") as any) || {}
  const customer = actor.actor_id

  if (!customer) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const service = req.scope.resolve(WISHLIST_MODULE) as WishlistModuleService
  const items = await service.listWishlistItemsByCustomer(customer)

  res.json({ items })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const actor = (req.scope.resolve("actor") as any) || {}
  const customer = actor.actor_id

  if (!customer) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const body = req.body as {
    product_id?: string
    variant_id?: string | null
    product_handle?: string | null
    title?: string
    thumbnail?: string | null
    price?: string | null
    metadata?: Record<string, any> | null
  }

  if (!body.product_id || !body.title) {
    res.status(400).json({ message: "product_id and title are required" })
    return
  }

  const service = req.scope.resolve(WISHLIST_MODULE) as WishlistModuleService
  const item = await service.addWishlistItemForCustomer(customer, {
    product_id: body.product_id,
    variant_id: body.variant_id ?? null,
    product_handle: body.product_handle ?? null,
    title: body.title,
    thumbnail: body.thumbnail ?? null,
    price: body.price ?? null,
    metadata: body.metadata ?? null,
  })

  res.status(201).json({ item })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const actor = (req.scope.resolve("actor") as any) || {}
  const customer = actor.actor_id

  if (!customer) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const { item_id, product_id } = req.query as {
    item_id?: string
    product_id?: string
  }

  const service = req.scope.resolve(WISHLIST_MODULE) as WishlistModuleService
  const deleted = await service.removeWishlistItemForCustomer(
    customer,
    item_id,
    product_id
  )

  if (!deleted) {
    res.status(404).json({ message: "Wishlist item not found" })
    return
  }

  res.json({ item: deleted })
}
