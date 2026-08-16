import { describe, expect, it, vi, beforeEach } from "vitest"

vi.mock("server-only", () => ({}))

const cookiesMock = vi.fn(() => ({
  get: vi.fn(),
  set: vi.fn(),
}))

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}))

describe("cookies helper", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns empty auth headers when no token exists", async () => {
    cookiesMock.mockReturnValue({
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    })
    const { getAuthHeaders } = await import("../cookies")

    const headers = await getAuthHeaders()

    expect(headers).toEqual({})
  })

  it("builds authorization header when token exists", async () => {
    cookiesMock.mockReturnValue({
      get: vi.fn().mockReturnValue({ value: "abc" }),
      set: vi.fn(),
    })
    const { getAuthHeaders } = await import("../cookies")

    const headers = await getAuthHeaders()

    expect(headers).toEqual({ authorization: "Bearer abc" })
  })
})
