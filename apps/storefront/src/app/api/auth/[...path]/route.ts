import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

async function handleRequest(
  request: NextRequest,
  pathStr: string,
  method: string
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value
  const cartId = cookieStore.get("_medusa_cart_id")?.value

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
  }

  if (token) {
    headers["authorization"] = `Bearer ${token}`
  }

  // Special handling for /carts endpoints without ID
  let finalPath = pathStr
  if (pathStr === "carts" && method === "GET" && cartId) {
    finalPath = `carts/${cartId}`
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
    }

    if (method !== "GET" && method !== "HEAD") {
      const body = await request.text()
      if (body) {
        fetchOptions.body = body
      }
    }

    const response = await fetch(`${BACKEND_URL}/store/${finalPath}`, fetchOptions)

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    console.error(`[API Auth] ${method} /store/${finalPath} failed:`, error)
    return NextResponse.json(
      { error: "API request failed" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const pathStr = path.join("/")
  return handleRequest(request, pathStr, "GET")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const pathStr = path.join("/")
  return handleRequest(request, pathStr, "POST")
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const pathStr = path.join("/")
  return handleRequest(request, pathStr, "PUT")
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const pathStr = path.join("/")
  return handleRequest(request, pathStr, "DELETE")
}
