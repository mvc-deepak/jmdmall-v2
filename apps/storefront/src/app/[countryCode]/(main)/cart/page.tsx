import LocalCartItems from "@modules/cart/components/local-cart-items"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default function Cart() {
  return <LocalCartItems />
}
