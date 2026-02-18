import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import http from "http"

function forwardToNextcloud(
  path: string,
  method: string,
  authHeaders: Record<string, string>,
  body?: string
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const reqHeaders: Record<string, string> = {
      "Accept": "application/json",
      "Host": "brothers.skymasons.xyz",
      ...authHeaders,
    }

    if (body) {
      reqHeaders["Content-Type"] = "application/json"
      reqHeaders["Content-Length"] = String(Buffer.byteLength(body))
    }

    const req = http.request(
      {
        hostname: "nextcloud",
        port: 80,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 500, data: data ? JSON.parse(data) : {} })
          } catch {
            resolve({ status: res.statusCode || 500, data: {} })
          }
        })
      }
    )

    req.on("error", reject)
    if (body) req.write(body)
    req.end()
  })
}

function getAuthHeaders(headersList: Headers): Record<string, string> | null {
  const username = headersList.get("x-authentik-username")
  if (!username) return null
  return {
    "X-Authentik-Username": username,
    "X-Authentik-Groups": headersList.get("x-authentik-groups") || "",
    "X-Authentik-Name": headersList.get("x-authentik-name") || "",
  }
}

export async function GET() {
  const headersList = await headers()
  const auth = getAuthHeaders(headersList)

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await forwardToNextcloud(
      "/apps/skymasonsnav/api/forms",
      "GET",
      auth
    )
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    console.error("Failed to fetch forms:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const auth = getAuthHeaders(headersList)

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const result = await forwardToNextcloud(
      "/apps/skymasonsnav/api/forms",
      "POST",
      auth,
      JSON.stringify(body)
    )
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    console.error("Failed to create form:", error)
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 })
  }
}
