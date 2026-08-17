import { Heading, Text } from "@modules/common/components/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="flex min-h-[420px] items-center justify-center px-4 py-16"
      data-testid="empty-cart-message"
    >
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Your bag is empty
        </span>
        <Heading
          level="h1"
          className="mt-5 text-3xl font-bold tracking-tight text-slate-900"
        >
          Nothing in your cart yet
        </Heading>
        <Text className="mt-4 text-base text-slate-600">
          Start shopping to add essentials and build your next order.
        </Text>
        <div className="mt-8">
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Explore products
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default EmptyCartMessage
