"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./header-icons";
import AnimatedSearchInput from "./animated-search-input";
import SearchDropdown from "./search-dropdown";

type SearchResult = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  variant: string | null;
  price: string;
  originalPrice: string | null;
};

interface JMDMALLHeaderClientProps {
  onSearch?: (query: string) => void;
  isMobileOnly?: boolean;
}

export default function JMDMALLHeaderClient({
  onSearch,
  isMobileOnly = false,
}: JMDMALLHeaderClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 760);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentCountryCode =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] || process.env.NEXT_PUBLIC_DEFAULT_REGION || "in"
      : process.env.NEXT_PUBLIC_DEFAULT_REGION || "in"

  const fetchResults = useCallback(async (query: string) => {
    const normalizedQuery = query?.trim() || ""

    if (normalizedQuery.length < 2) {
      setSearchResults([])
      setIsOpen(false)
      return
    }

    try {
      const apiUrl = new URL(`/api/search`, window.location.origin)
      apiUrl.searchParams.set("q", normalizedQuery)

      const response = await fetch(apiUrl.toString())
      if (!response.ok) {
        setSearchResults([])
        setIsOpen(false)
        return
      }

      const data = await response.json()
      setSearchResults(data.products || [])
      setIsOpen(true)
    } catch {
      setSearchResults([])
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchResults(searchQuery);
    }, 250);

    return () => clearTimeout(timeout);
  }, [fetchResults, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const normalizedQuery = searchQuery.trim();

      if (!normalizedQuery) {
        return;
      }

      if (onSearch) {
        onSearch(normalizedQuery);
      }

      router.push(`/${currentCountryCode}/store?q=${encodeURIComponent(normalizedQuery)}`);
      setIsOpen(false);
    }
  };

  const closeDropdown = () => setIsOpen(false);

  const renderSearch = () => (
    <div className="search-box-wrapper" ref={containerRef}>
      <div className="search-box">
        <SearchIcon size={20} />
        <AnimatedSearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
      <SearchDropdown
        results={searchResults}
        query={searchQuery}
        countryCode={currentCountryCode}
        isOpen={isOpen}
        onClose={closeDropdown}
      />
    </div>
  );

  if (isMobileOnly) {
    if (!isMobile) return null;

    return (
      <div className="header-mobile-search">
        <div className="search-container-mobile">
          {renderSearch()}
        </div>
      </div>
    );
  }

  if (isMobile) return null;

  return <div className="search-container">{renderSearch()}</div>;
}
