'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { HeartIcon } from './header-icons'
import { useWishlist } from '@lib/hooks/useWishlist'

export default function JMDMALLWishlist() {
  const { wishlist } = useWishlist()
  const { countryCode } = useParams<{ countryCode?: string }>()
  const href = countryCode ? `/${countryCode}/wishlist` : '/wishlist'

  return (
    <Link href={href} className="relative inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
      <HeartIcon size={18} />
      {wishlist.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {wishlist.length}
        </span>
      )}
    </Link>
  )
}
