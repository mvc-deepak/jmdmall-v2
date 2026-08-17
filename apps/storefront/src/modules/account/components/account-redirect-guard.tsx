'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function AccountRedirectGuard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect')
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    if (!redirectTarget || hasCheckedRef.current) {
      return
    }

    hasCheckedRef.current = true

    const redirectToCheckout = async () => {
      try {
        const response = await fetch('/store/customers/me', {
          cache: 'no-store',
          credentials: 'include',
        })

        if (!response.ok) {
          return
        }

        const destination = decodeURIComponent(redirectTarget)
        router.replace(destination)
      } catch {
        // Ignore auth check failures and let the page render normally.
      }
    }

    redirectToCheckout()
  }, [redirectTarget, router])

  return null
}
