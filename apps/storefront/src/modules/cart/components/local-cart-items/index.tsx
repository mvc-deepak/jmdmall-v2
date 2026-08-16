'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@lib/hooks/useCart'
import { useWishlist } from '@lib/hooks/useWishlist'
import Link from 'next/link'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

interface CartItem {
  variant_id: string
  product_id: string
  quantity: number
  title: string
  price: number
  image?: string
  sku?: string
  variant_title?: string
}

interface SavedAddress {
  id: string
  first_name: string
  last_name: string
  phone: string
  address_1: string
  city: string
  postal_code: string
}

export default function LocalCartItems() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart()
  const { addItem: addToWishlist } = useWishlist()
  const [isMounted, setIsMounted] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'auth' | 'details'>('auth')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [useNewAddress, setUseNewAddress] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pin: '',
    paymentMethod: 'card',
  })

  useEffect(() => {
    setIsMounted(true)
    fetchSavedAddresses()
  }, [])

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch('/store/customers/me/addresses', {
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        const addresses = data.addresses || []

        if (addresses.length > 0) {
          setIsLoggedIn(true)
          setSavedAddresses(addresses)
          setSelectedAddressId(addresses[0].id)
          setUseNewAddress(false)
          setCheckoutStep('details')
        } else {
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
      setIsLoggedIn(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="rounded-[28px] border border-white/40 bg-white/60 p-8 text-center shadow-[0_30px_80px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Shopping Cart</h1>
      </div>
    )
  }

  const items = cart?.items || []
  const total = cart?.total || 0

  if (!items || items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/60 p-8 text-center shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl md:p-12">
        <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-violet-300/40 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="relative">
          <span className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-700">
            Empty bag
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Your cart is feeling a little light.</h1>
          <p className="mt-3 text-sm text-slate-600">Add a few curated essentials and come back with a fuller story.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const handleQuantityChange = async (variantId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(variantId)
    } else {
      await updateQuantity(variantId, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (!items || items.length === 0) {
      alert('Cart is empty')
      return
    }
    setShowCheckout(true)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pin) {
      alert('Please fill all fields')
      return
    }

    try {
      alert(`Order placed! Total: ₹${Math.round(total)}`)
      await clearCart()
      setShowCheckout(false)
      setCheckoutStep('auth')
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order')
    }
  }

  const handleContinueAsGuest = () => {
    setIsLoggedIn(false)
    setCheckoutStep('details')
  }

  const handleMoveToWishlist = async (item: { product_id: string; variant_id: string; product_handle?: string; title: string; image?: string; price: number }) => {
    await addToWishlist({
      id: item.product_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      handle: item.product_handle || item.product_id,
      title: item.title,
      thumbnail: item.image || null,
      price: `₹${Math.round(item.price)}`,
    })

    await removeItem(item.variant_id)
  }

  const handleSignIn = () => {
    // Redirect to login - guest cart items cleared on login per Medusa flow
  }

  return (
    <div className="py-2 md:py-4">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-4 md:items-start">
        <div className="space-y-3">
          <h1 className="text-xl md:text-2xl font-bold">Shopping Cart ({items.length})</h1>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 md:grid md:grid-cols-7 md:gap-2">
              <div className="col-span-3">Product</div>
              <div className="text-center">Price</div>
              <div className="text-center">Qty</div>
              <div className="text-right">Total</div>
              <div className="text-right">Action</div>
            </div>

            <div className="divide-y divide-slate-200">
              {items.map((item, idx) => {
                const productLink = item.product_handle ? `/products/${item.product_handle}` : '/products'

                return (
                  <div key={item.variant_id || idx} className="px-2 py-2 text-xs transition-colors hover:bg-slate-50 md:px-3 md:py-3">
                    <div className="flex items-center gap-2 md:grid md:grid-cols-7 md:gap-2 md:items-center">
                      <div className="flex min-w-0 items-center gap-2 md:col-span-3">
                        <LocalizedClientLink href={productLink} className="flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 transition-opacity hover:opacity-90">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="h-12 w-12 object-cover md:h-14 md:w-14" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center bg-slate-200 text-[10px] font-medium text-slate-500 md:h-14 md:w-14">
                              IMG
                            </div>
                          )}
                        </LocalizedClientLink>

                        <div className="min-w-0 flex-1">
                          <LocalizedClientLink href={productLink} className="block text-sm font-medium text-slate-900 transition hover:text-emerald-700">
                            <span className="line-clamp-2">{item.title}</span>
                          </LocalizedClientLink>
                          {item.variant_title && <p className="mt-0.5 text-[11px] text-slate-500">{item.variant_title}</p>}
                          {item.sku && <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-400">{item.sku}</p>}
                        </div>
                      </div>

                      <div className="hidden md:block text-center">
                        <p className="text-sm font-medium text-slate-900">₹{Math.round(item.price)}</p>
                      </div>

                      <div className="ml-auto flex items-center justify-center gap-1 md:ml-0">
                        <button
                          onClick={() => handleQuantityChange(item.variant_id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                        >
                          −
                        </button>
                        <span className="min-w-[18px] text-center text-xs font-semibold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.variant_id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <div className="hidden md:block text-right">
                        <p className="text-sm font-semibold text-slate-900">₹{Math.round(item.price * item.quantity)}</p>
                      </div>

                      <div className="ml-auto text-right md:ml-0">
                        <button
                          onClick={() => handleMoveToWishlist(item)}
                          className="mb-1.5 block w-full rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Move to wishlist
                        </button>
                        <button
                          onClick={() => removeItem(item.variant_id)}
                          className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-600 transition hover:bg-rose-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <Link href="/in/store" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <aside className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 space-y-3 md:sticky md:top-0 shadow-sm md:self-start">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">Order Total</h2>
          <div className="space-y-2 text-xs border-b border-gray-200 pb-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{Math.round(total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-gray-500">TBD</span>
            </div>
          </div>
          <div className="flex justify-between items-center font-bold text-sm">
            <span>Total</span>
            <span className="text-emerald-600">₹{Math.round(total)}</span>
          </div>

          <div className="pt-1 border-t border-gray-200">
            <LocalizedClientLink
              href="/checkout?step=address"
              className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:bg-gray-400"
            >
              Checkout
            </LocalizedClientLink>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <p className="text-[11px] text-gray-600 mb-2">Already a customer?</p>
            <Link href="/in/account/login" className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-800 hover:border-emerald-600 hover:text-emerald-700 transition">
              Login
            </Link>
          </div>
        </aside>
      </div>

      {showCheckout && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {checkoutStep === 'auth' ? 'Login or continue' : 'Checkout details'}
            </h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Close
            </button>
          </div>

          {checkoutStep === 'auth' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Sign in to access saved addresses and faster checkout.</p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  onClick={handleSignIn}
                  className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <a href="/in/account/login" className="inline-block w-full">Sign In</a>
                </button>

                <button
                  onClick={handleContinueAsGuest}
                  className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Continue as guest
                </button>
              </div>

              <p className="text-center text-xs text-slate-500">
                Don’t have an account?{' '}
                <Link href="/in/account/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
                  Create one
                </Link>
              </p>
            </div>
          )}

          {checkoutStep === 'details' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Delivery address</h3>

                  {savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="radio" checked={!useNewAddress} onChange={() => setUseNewAddress(false)} />
                        <span>Use saved address</span>
                      </label>

                      {!useNewAddress && (
                        <select
                          value={selectedAddressId}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
                        >
                          {savedAddresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.first_name} {addr.last_name} - {addr.address_1}, {addr.city} {addr.postal_code}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" checked={useNewAddress} onChange={() => setUseNewAddress(true)} />
                    <span>{savedAddresses.length > 0 ? 'Use a different address' : 'Enter a new address'}</span>
                  </label>

                  {useNewAddress && (
                    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
                      <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleFormChange} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400" />
                      <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleFormChange} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400" />
                      <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleFormChange} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 md:col-span-2" />
                      <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleFormChange} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400" />
                      <input type="text" name="pin" placeholder="PIN Code" value={formData.pin} onChange={handleFormChange} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Payment method</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                    <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                      <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleFormChange} />
                      <span>Card</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                      <input type="radio" name="paymentMethod" value="upi" checked={formData.paymentMethod === 'upi'} onChange={handleFormChange} />
                      <span>UPI</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                      <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleFormChange} />
                      <span>COD</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-200 pt-4">
                <button
                  onClick={() => setCheckoutStep('auth')}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Place order
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
