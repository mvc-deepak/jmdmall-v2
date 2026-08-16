import { retrieveCart } from "@lib/data/cart";
import JMDMALLCartClient from "./jmdmall-cart-client";

export default async function JMDMALLCartServer() {
  const cart = await retrieveCart().catch(() => null);

  const itemCount = cart?.items?.reduce((acc, item) => {
    return acc + (item.quantity || 0);
  }, 0) || 0;

  const total = cart?.total ?? 0;

  return <JMDMALLCartClient itemCount={itemCount} total={total} />;
}
