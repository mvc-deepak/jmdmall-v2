"use client"

import Link from "next/link"
import { useMemo } from "react"

type SearchResult = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  variant: string | null
  price: string
  originalPrice: string | null
}

type SearchDropdownProps = {
  results: SearchResult[]
  query: string
  countryCode?: string
  isOpen: boolean
  onClose?: () => void
}

export default function SearchDropdown({
  results,
  query,
  countryCode = process.env.NEXT_PUBLIC_DEFAULT_REGION || "in",
  isOpen,
  onClose,
}: SearchDropdownProps) {
  const items = useMemo(
    () =>
      results
        .filter((result) => Boolean(result.handle))
        .map((result) => (
          <li key={result.id}>
            <Link
              href={`/${countryCode}/products/${result.handle}`}
              className="search-result-item"
              onClick={onClose}
            >
            <div className="search-result-image">
              {result.thumbnail ? (
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  loading="lazy"
                />
              ) : (
                <div className="search-result-placeholder">No image</div>
              )}
            </div>
            <div className="search-result-copy">
              <div className="search-result-title">{result.title}</div>
              {result.variant && (
                <div className="search-result-variant">{result.variant}</div>
              )}
              <div className="search-result-price">{result.price}</div>
            </div>
          </Link>
        </li>
      )),
    [results, onClose, countryCode]
  )

  if (!isOpen || !query || query.trim().length < 2 || items.length === 0) {
    return null
  }

  return (
    <div className="search-dropdown" data-testid="search-dropdown">
      <div className="search-dropdown-header">Search results</div>
      <ul>{items}</ul>
    </div>
  )
}
