"use server"

import { getOrSetCart } from "@lib/data/cart"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheTag } from "@lib/data/cookies"

export async function syncLocalCartToMedusaAction(
  localCartItems: any[],
  countryCode: string
): Promise<HttpTypes.StoreCart | null> {
  if (!Array.isArray(localCartItems) || localCartItems.length === 0) {
    return null
  }

  try {
    const cart = await getOrSetCart(countryCode)

    if (!cart) {
      throw new Error("Failed to create or retrieve cart")
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    for (const item of localCartItems) {
      if (!item.variant_id || !item.quantity) {
        continue
      }

      try {
        await sdk.store.cart.createLineItem(
          cart.id,
          {
            variant_id: item.variant_id,
            quantity: item.quantity,
          },
          {},
          headers
        )
      } catch (error) {
        console.error(`Failed to add item ${item.variant_id} to cart:`, error)
      }
    }

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)

    return await sdk.client
      .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cart.id}`, {
        method: "GET",
        query: {
          fields:
            "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name",
        },
        headers,
      })
      .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
      .catch(() => null)
  } catch (error) {
    console.error("Failed to sync local cart to Medusa:", error)
    return null
  }
}
