import { CartItem } from "@lib/types/cart"

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
}

const fetchJson = async <T>(url: string, init: RequestInit = {}) => {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
  })

  if (!response.ok) {
    throw new Error(`Cart sync request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const getAuthenticatedCustomer = async (): Promise<boolean> => {
  try {
    const response = await fetch("/store/customers/me", {
      method: "GET",
      headers: DEFAULT_HEADERS,
      credentials: "include",
    })

    return response.ok
  } catch {
    return false
  }
}

export const getServerCartById = async (cartId: string) => {
  try {
    return await fetchJson<{ cart: unknown }>(`/store/carts/${cartId}`, {
      method: "GET",
    })
  } catch {
    return null
  }
}

export const createServerCart = async (regionId: string) => {
  try {
    return await fetchJson<{ cart: unknown }>("/store/carts", {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ region_id: regionId }),
    })
  } catch {
    return null
  }
}

export const createOrUpdateServerLineItem = async (
  cartId: string,
  variantId: string,
  quantity: number
) => {
  return await fetchJson<{ cart: unknown }>(`/store/carts/${cartId}/line-items`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ variant_id: variantId, quantity }),
  })
}

export const getServerLineItems = async (cartId: string) => {
  try {
    const response = await fetch(`/store/carts/${cartId}/line-items`, {
      method: "GET",
      headers: DEFAULT_HEADERS,
      credentials: "include",
    })

    if (!response.ok) {
      return []
    }

    return (await response.json()) as Array<{ id: string; variant_id: string; quantity: number }>
  } catch {
    return []
  }
}

export const deleteServerLineItem = async (cartId: string, lineItemId: string) => {
  await fetchJson<{ cart: unknown }>(`/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: "DELETE",
  })
}

export const getServerCartItems = async (cartId: string) => {
  const serverCart = await getServerCartById(cartId)
  if (!serverCart || !serverCart.cart) {
    return null
  }
  return serverCart.cart
}
