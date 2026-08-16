import { describe, expect, it, vi, beforeEach } from "vitest"

describe("orders data layer", () => {
  let sdk: any
  let ordersModule: typeof import("../orders")
  let cookiesModule: typeof import("../cookies")

  beforeEach(async () => {
    vi.resetModules()

    sdk = {
      client: {
        fetch: vi.fn(),
      },
      store: {
        order: {
          requestTransfer: vi.fn(),
          acceptTransfer: vi.fn(),
          declineTransfer: vi.fn(),
        },
      },
    }

    vi.doMock("@lib/config", () => ({ sdk }))
    vi.doMock("../cookies", async () => ({
      getAuthHeaders: vi.fn().mockResolvedValue({ authorization: "Bearer token" }),
      getCacheOptions: vi.fn().mockResolvedValue({ tags: ["orders-123"] }),
    }))

    cookiesModule = await import("../cookies")
    ordersModule = await import("../orders")
  })

  it("returns orders list when fetch succeeds", async () => {
    sdk.client.fetch.mockResolvedValueOnce({ orders: [{ id: "order_1" }] })

    const orders = await ordersModule.listOrders()

    expect(orders).toEqual([{ id: "order_1" }])
    expect(sdk.client.fetch).toHaveBeenCalledWith(
      "/store/orders",
      expect.objectContaining({
        method: "GET",
      })
    )
  })

  it("handles order retrieval error by returning error object", async () => {
    const err = new Error("401 Unauthorized")
    sdk.store.order.requestTransfer.mockRejectedValueOnce(err)

    const formData = {
      get: (key: string) => (key === "order_id" ? "order_1" : null),
    } as FormData

    const response = await ordersModule.createTransferRequest(
      { success: false, error: null, order: null },
      formData
    )

    expect(response.success).toBe(false)
    expect(response.error).toContain("401")
  })
})
