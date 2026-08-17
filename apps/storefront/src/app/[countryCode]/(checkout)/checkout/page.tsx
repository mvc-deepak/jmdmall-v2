import { retrieveCart, getOrSetCart, addToCart } from "@lib/data/cart"
import { readLocalGuestCartCookieServer } from "@lib/data/local-cart-cookie"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const customer = await retrieveCustomer()

  if (!customer) {
    redirect(
      `/${countryCode}/account?redirect=${encodeURIComponent(`/${countryCode}/checkout?step=address`)}`
    )
  }

  let cart = await retrieveCart()

  if (!cart) {
    cart = await getOrSetCart(countryCode).catch(() => null)
  }

  // Sync local guest cart items to the server cart
  if (cart) {
    const localCart = await readLocalGuestCartCookieServer()
    if (localCart?.items && Array.isArray(localCart.items) && localCart.items.length > 0) {
      for (const item of localCart.items) {
        if (item.variant_id && item.quantity) {
          try {
            await addToCart({
              variantId: item.variant_id,
              quantity: item.quantity,
              countryCode,
            }).catch(() => {
              // Silently fail if item add fails
            })
          } catch {}
        }
      }
      // Refresh cart after syncing items
      cart = await retrieveCart()
    }
  }

  if (!cart) {
    return (
      <div className="content-container py-12">
        <div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Cart empty
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            Your cart is waiting for essentials
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Add products to your cart before continuing to checkout.
          </p>
          <LocalizedClientLink
            href="/store"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Continue shopping
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
