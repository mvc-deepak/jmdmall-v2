export const getCountryCodeFromPath = (path = window.location.pathname) => {
  const segments = path.split("/").filter(Boolean)
  return segments[0] || process.env.NEXT_PUBLIC_DEFAULT_REGION || "in"
}

export const getCheckoutRedirectPath = (countryCode: string) =>
  `/${countryCode}/checkout?step=address`

export const isCustomerAuthenticated = async (): Promise<boolean> => {
  const hasAuthCookie = document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith("_medusa_jwt="))

  if (hasAuthCookie) {
    return true
  }

  try {
    const response = await fetch("/store/customers/me", {
      cache: "no-store",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })

    return response.ok
  } catch {
    return false
  }
}

export const getAccountLoginRedirectUrl = (countryCode: string) => {
  const checkoutUrl = getCheckoutRedirectPath(countryCode)
  return `/${countryCode}/account?redirect=${encodeURIComponent(checkoutUrl)}`
}
