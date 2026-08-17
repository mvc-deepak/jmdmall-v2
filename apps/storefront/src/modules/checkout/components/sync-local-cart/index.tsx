"use client"

import { useEffect, useState } from "react"
import { syncLocalCartToMedusaAction } from "@lib/actions/sync-cart"
import { readLocalGuestCartCookieServer } from "@lib/data/local-cart-cookie"

export default function SyncLocalCart({ cartId }: { cartId: string }) {
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (synced || !cartId) return

    const syncCart = async () => {
      try {
        const localCart = await readLocalGuestCartCookieServer()
        if (localCart?.items && Array.isArray(localCart.items) && localCart.items.length > 0) {
          await syncLocalCartToMedusaAction(localCart.items, "US")
          setSynced(true)
          window.location.reload()
        }
      } catch (error) {
        console.error("Failed to sync local cart:", error)
      }
    }

    syncCart()
  }, [cartId, synced])

  return null
}
