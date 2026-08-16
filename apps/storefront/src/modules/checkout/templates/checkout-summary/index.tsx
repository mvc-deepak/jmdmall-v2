import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const items = cart.items || []
  const subtotal = cart.subtotal || 0
  const shipping_total = cart.shipping_total || 0
  const tax_total = cart.tax_total || 0
  const total = cart.total || 0

  return (
    <div className="sticky top-2 border border-gray-200 rounded p-3 space-y-3">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-2">Order Items</h2>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-gray-200 max-h-72 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded p-2 bg-gray-50">
              {/* Item Image */}
              <div className="w-full aspect-square bg-gray-100 rounded overflow-hidden flex items-center justify-center mb-1">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">IMG</span>
                )}
              </div>

              {/* Item Details */}
              <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.title}</p>
              {item.variant_title && item.variant_title !== 'Default Title' && (
                <p className="text-xs text-gray-600 line-clamp-1">{item.variant_title}</p>
              )}

              {/* Price & Qty */}
              <div className="flex justify-between items-center mt-1 text-xs">
                <span className="font-semibold text-emerald-600">₹{Math.round((item.subtotal || 0) / 100)}</span>
                <span className="bg-emerald-100 text-emerald-700 px-1.5 rounded font-semibold text-xs">x{item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals - Compact */}
      <div className="space-y-1 text-xs pb-3 border-b border-gray-200">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{Math.round(subtotal / 100)}</span>
        </div>
        {shipping_total > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>₹{Math.round(shipping_total / 100)}</span>
          </div>
        )}
        {tax_total > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>₹{Math.round(tax_total / 100)}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-gray-900">Total</span>
        <span className="text-xl font-bold text-emerald-600">₹{Math.round(total / 100)}</span>
      </div>
    </div>
  )
}

export default CheckoutSummary
