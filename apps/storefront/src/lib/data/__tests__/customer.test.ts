import { describe, expect, it, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))

describe("customer data layer", () => {
  let sdk: any
  let customerModule: typeof import("../customer")
  let cookiesModule: typeof import("../cookies")
  let nextCookiesMock: any

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
          create: vi.fn(),
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
      removeAuthToken: vi.fn().mockResolvedValue(undefined),
      setPendingCustomer: vi.fn().mockResolvedValue(undefined),
      removePendingCustomer: vi.fn().mockResolvedValue(undefined),
      getCacheTag: vi.fn().mockResolvedValue("customers-123"),
      getCacheOptions: vi.fn().mockResolvedValue({ tags: ["customers-123"] }),
      getCartId: vi.fn().mockResolvedValue(null),
      setCartId: vi.fn().mockResolvedValue(undefined),
      removeCartId: vi.fn().mockResolvedValue(undefined),
    }))

    cookiesModule = await import("../cookies")
    customerModule = await import("../customer")
  })

  it.skip("sets auth cookies at the root path so the login persists across storefront routes", async () => {
    nextCookiesMock = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    }

    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue(nextCookiesMock),
    }))

    const { setAuthToken, removeAuthToken } = await import("../cookies")

    await setAuthToken("customer-token")
    await removeAuthToken()

    expect(nextCookiesMock.set).toHaveBeenNthCalledWith(
      1,
      "_medusa_jwt",
      "customer-token",
      expect.objectContaining({ path: "/" })
    )
    expect(nextCookiesMock.set).toHaveBeenNthCalledWith(
      2,
      "_medusa_jwt",
      "",
      expect.objectContaining({ path: "/", maxAge: -1 })
    )
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
    sdk.store.cart.create.mockResolvedValueOnce({ cart: { id: "cart_123" } })

    const result = await customerModule.login(null, new FormData())

    expect(result).toEqual({ state: "success" })
    expect(cookiesModule.setAuthToken).toHaveBeenCalledWith("customer-token")
  })

  it("creates and stores a server cart when the customer logs in without a cart id", async () => {
    sdk.auth.login.mockResolvedValueOnce("server-token")
    sdk.store.customer.retrieve.mockRejectedValueOnce(new Error("Not found"))
    sdk.store.customer.create.mockResolvedValueOnce({ customer: { id: "cust_1" } })
    sdk.auth.login.mockResolvedValueOnce("customer-token")
    sdk.store.cart.create.mockResolvedValueOnce({ cart: { id: "cart_123" } })
    sdk.store.cart.transferCart.mockResolvedValueOnce({ cart: { id: "cart_123" } })

    const result = await customerModule.login(null, new FormData())

    expect(result).toEqual({ state: "success" })
    expect(sdk.store.cart.create).toHaveBeenCalled()
    expect(cookiesModule.setCartId).toHaveBeenCalledWith("cart_123")
  })
})
