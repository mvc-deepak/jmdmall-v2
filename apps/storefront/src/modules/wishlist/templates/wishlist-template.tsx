'use client'

import { useState } from 'react'
import Link from 'next/link'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { useWishlist } from '@lib/hooks/useWishlist'
import { useCart } from '@lib/hooks/useCart'

export default function WishlistTemplate() {
  const { wishlist, removeItem } = useWishlist()
  const { addItem } = useCart()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const handleAddToCart = async (item: { product_id?: string; variant_id?: string; handle: string; title: string; thumbnail?: string | null; price?: string | null }, quantity = 1) => {
    if (!item.product_id || !item.variant_id) return

    const parsedPrice = Number(String(item.price || '').replace(/[^\d.]/g, '')) || 0

    await addItem({
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_handle: item.handle,
      quantity,
      title: item.title,
      price: parsedPrice,
      image: item.thumbnail || undefined,
    })
  }

  const getQuantity = (itemId: string) => quantities[itemId] ?? 1

  const updateQuantity = (itemId: string, nextQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, nextQuantity),
    }))
  }

  if (!wishlist.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center md:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Wishlist</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">No saved products yet</h1>
          <p className="mt-3 text-sm text-slate-600">Tap the heart icon on any product to save it for later.</p>
          <Link href="/store" className="mt-6 inline-flex rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Saved items</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">My Wishlist</h1>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          {wishlist.length} item{wishlist.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {wishlist.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex gap-3">
              <LocalizedClientLink href={`/products/${item.handle}`} className="block flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="h-24 w-24 object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center bg-slate-200 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Product
                  </div>
                )}
              </LocalizedClientLink>

              <div className="min-w-0 flex-1">
                <LocalizedClientLink href={`/products/${item.handle}`} className="block text-sm font-semibold text-slate-900 hover:text-emerald-700">
                  <span className="line-clamp-2">{item.title}</span>
                </LocalizedClientLink>
                {item.price && <p className="mt-2 text-sm font-semibold text-emerald-600">{item.price}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, getQuantity(item.id) - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-base font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      −
                    </button>
                    <span className="min-w-[20px] text-center text-xs font-semibold text-slate-900">{getQuantity(item.id)}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, getQuantity(item.id) + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-base font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(item, getQuantity(item.id))}
                    className="inline-flex rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Add to cart
                  </button>

                  <LocalizedClientLink href={`/products/${item.handle}`} className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300">
                    View
                  </LocalizedClientLink>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
