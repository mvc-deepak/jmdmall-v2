"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: unknown
}) => {
  const { countryCode } = useParams<{ countryCode?: string }>()
  const resolvedCountryCode =
    countryCode && countryCode.trim()
      ? countryCode
      : typeof window !== "undefined"
        ? window.location.pathname.split("/")[1] || process.env.NEXT_PUBLIC_DEFAULT_REGION || "in"
        : process.env.NEXT_PUBLIC_DEFAULT_REGION || "in"

  return (
    <Link href={`/${resolvedCountryCode}${href}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
