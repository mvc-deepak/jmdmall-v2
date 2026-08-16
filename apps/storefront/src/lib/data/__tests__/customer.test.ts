import { describe, expect, it, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))

describe("customer data layer", () => {
  let sdk: any
  let customerModule: typeof import("../customer")
  let cookiesModule: typeof import("../cookies")

  beforeEach(async () => {
    vi.resetModules()

    sdk = {
      auth: {
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        verification: {
          request: vi.fn(),
          confirm: vi.fn(),
        },
      },
      store: {
        customer: {
          retrieve: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        cart: {
          transferCart: vi.fn(),
        },
      },
      client: {
        fetch: vi.fn(),
      },
    }

    vi.doMock("@lib/config", () => ({ sdk }))
    vi.doMock("../cookies", async () => ({
      getAuthHeaders: vi.fn().mockResolvedValue({ authorization: "Bearer token" }),
      getPendingCustomer: vi.fn().mockResolvedValue({
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        phone: "1234567890",
      }),
      setAuthToken: vi.fn().mockResolvedValue(undefined),
      setPendingCustomer: vi.fn().mockResolvedValue(undefined),
      removePendingCustomer: vi.fn().mockResolvedValue(undefined),
      getCacheTag: vi.fn().mockResolvedValue("customers-123"),
      getCacheOptions: vi.fn().mockResolvedValue({ tags: ["customers-123"] }),
      getCartId: vi.fn().mockResolvedValue(null),
      removeCartId: vi.fn().mockResolvedValue(undefined),
    }))

    cookiesModule = await import("../cookies")
    customerModule = await import("../customer")
  })

  it("returns null when retrieveCustomer fails with invalid token", async () => {
    sdk.client.fetch.mockRejectedValueOnce(new Error("Unauthorized"))

    const customer = await customerModule.retrieveCustomer()

    expect(customer).toBeNull()
    expect(sdk.client.fetch).toHaveBeenCalledWith(
      "/store/customers/me",
      expect.objectContaining({
        method: "GET",
      })
    )
  })

  it("logs in and stores auth token when completeLogin succeeds", async () => {
    sdk.auth.login.mockResolvedValueOnce("server-token")
    sdk.store.customer.retrieve.mockRejectedValueOnce(new Error("Not found"))
    sdk.store.customer.create.mockResolvedValueOnce({ customer: { id: "cust_1" } })
    sdk.auth.login.mockResolvedValueOnce("customer-token")

    const result = await customerModule.login(null, new FormData())

    expect(result).toEqual({ state: "success" })
    expect(cookiesModule.setAuthToken).toHaveBeenCalledWith("customer-token")
  })
})
