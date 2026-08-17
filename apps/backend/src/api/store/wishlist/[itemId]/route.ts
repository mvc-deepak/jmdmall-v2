import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../../modules/wishlist"
import WishlistModuleService from "../../../../modules/wishlist/service"

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const customer = req.auth?.customer

  if (!customer) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const { itemId } = req.params

  const service = req.scope.resolve(WISHLIST_MODULE) as WishlistModuleService
  const deleted = await service.removeWishlistItemForCustomer(customer.id, itemId)

  if (!deleted) {
    res.status(404).json({ message: "Wishlist item not found" })
    return
  }

  res.json({ item: deleted })
}
