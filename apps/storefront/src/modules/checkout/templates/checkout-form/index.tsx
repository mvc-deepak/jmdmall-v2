import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  return (
    <div className="w-full grid grid-cols-1 gap-y-2">
      <div className="border border-gray-200 rounded p-2 overflow-hidden">
        <div style={{ zoom: '0.9', transformOrigin: 'top left', marginBottom: '-10%' }}>
          <Addresses cart={cart} customer={customer} />
        </div>
      </div>

      <div className="border border-gray-200 rounded p-2 overflow-hidden">
        <div style={{ zoom: '0.85', transformOrigin: 'top left', marginBottom: '-15%' }}>
          <Shipping cart={cart} availableShippingMethods={shippingMethods} />
        </div>
      </div>

      <div className="border border-gray-200 rounded p-2 overflow-hidden">
        <div style={{ zoom: '0.85', transformOrigin: 'top left', marginBottom: '-15%' }}>
          <Payment cart={cart} availablePaymentMethods={paymentMethods} />
        </div>
      </div>

      <div className="border border-gray-200 rounded p-2 overflow-hidden">
        <div style={{ zoom: '0.9', transformOrigin: 'top left', marginBottom: '-10%' }}>
          <Review cart={cart} />
        </div>
      </div>
    </div>
  )
}
