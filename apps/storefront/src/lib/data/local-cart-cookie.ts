export const LOCAL_CART_COOKIE_NAME = "jmdmall_local_cart"

export function setLocalGuestCartCookie(cart: Record<string, any> | null) {
  if (typeof document === "undefined") {
    return
  }

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    document.cookie = `${LOCAL_CART_COOKIE_NAME}=; Max-Age=0; path=/; SameSite=Lax`
    return
  }

  document.cookie = `${LOCAL_CART_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(cart)
  )}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export async function readLocalGuestCartCookieServer() {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const value = cookieStore.get(LOCAL_CART_COOKIE_NAME)?.value

    if (!value) {
      return null
    }

    return JSON.parse(value)
  } catch {
    return null
  }
}
