"use client";

import Link from "next/link";
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CartIcon } from "./header-icons";
import "./jmdmall-cart.css";
import React, { useEffect, useState } from "react";
import { useCart } from '@lib/hooks/useCart'

interface JMDMALLCartProps {
  itemCount?: number;
  total?: number | string;
}

const CART_STORAGE_KEY = "medusa_cart"

const formatPrice = (price: number | string): string => {
  if (typeof price === "string") return price;

  const numPrice = parseFloat(price.toString());
  if (isNaN(numPrice)) return "0";

  const roundedPrice = Math.round(numPrice);
  return roundedPrice.toLocaleString("en-IN");
};

export const JMDMALLCart = ({ itemCount = 0, total = 0 }: JMDMALLCartProps) => {
  const [currentCount, setCurrentCount] = useState(itemCount);
  const [currentTotal, setCurrentTotal] = useState<number | string>(total);
  const [isAnimating, setIsAnimating] = useState(false);

  const { cart } = useCart()

  useEffect(() => {
    if (cart) {
      const totalItems = cart.items?.reduce(
        (acc: number, item: { quantity: number }) => acc + (item.quantity || 0),
        0
      );
      setCurrentCount(totalItems || 0);
      setCurrentTotal(cart.total ?? 0);
      return
    }

    setCurrentCount(itemCount);
    setCurrentTotal(total);
  }, [cart, itemCount, total])

  useEffect(() => {
    if (!cart) return
    setIsAnimating(true)
    const timeout = window.setTimeout(() => setIsAnimating(false), 260)
    return () => window.clearTimeout(timeout)
  }, [cart])

  const displayPrice = formatPrice(currentTotal);
  const hasItems = currentCount > 0;

  return (
    <div className="jmd-cart-container">
      <LocalizedClientLink
        href="/cart"
        className={`jmd-cart-button ${isAnimating ? "jmd-cart-button-pulse" : ""}`}
        aria-label={`Cart, ${currentCount} items, ₹${displayPrice}`}
      >
        <span className="jmd-cart-icon-wrap">
          <CartIcon size={24} />
          {hasItems && (
            <span className={`jmd-cart-badge ${isAnimating ? "jmd-cart-badge-pop" : ""}`}>
              {currentCount}
            </span>
          )}
        </span>

        {hasItems && (
          <span className="jmd-cart-total">₹{displayPrice}</span>
        )}
      </LocalizedClientLink>
    </div>
  );
};

export default JMDMALLCart;
