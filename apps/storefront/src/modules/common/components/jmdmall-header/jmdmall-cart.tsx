"use client";

import Link from "next/link";
import { CartIcon } from "./header-icons";
import "./jmdmall-cart.css";
import React from "react";

interface JMDMALLCartProps {
  itemCount?: number;
  total?: number | string;
}

export const JMDMALLCart = ({ itemCount = 0, total = 0 }: JMDMALLCartProps) => {
  const formatPrice = (price: number | string): string => {
    if (typeof price === "string") return price;

    const numPrice = parseFloat(price.toString());
    if (isNaN(numPrice)) return "0";

    // Format with Indian numbering system
    const roundedPrice = Math.round(numPrice);
    return roundedPrice.toLocaleString("en-IN");
  };

  const displayPrice = formatPrice(total);
  const hasItems = itemCount > 0;

  return (
    <div className="jmd-cart-container">
      <Link
        href="/cart"
        className="jmd-cart-button"
        aria-label={`Cart, ${itemCount} items, ₹${displayPrice}`}
      >
        <CartIcon size={24} />

        {hasItems && (
          <div className="jmd-cart-details">
            <div className="jmd-cart-items">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </div>
            <div className="jmd-cart-price">₹{displayPrice}</div>
          </div>
        )}
      </Link>
    </div>
  );
};

export default JMDMALLCart;
