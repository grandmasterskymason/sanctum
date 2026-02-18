import http from "http"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

function getAuthHeaders(headersList: Headers): Record<string, string> | null {
  const username = headersList.get("x-authentik-username")
  if (!username) return null

  return {
    "X-Authentik-Username": username,
    "X-Authentik-Groups": headersList.get("x-authentik-groups") || "",
    "X-Authentik-Name": headersList.get("x-authentik-name") || "",
  }
}

function nextcloudRequest(
  method: string,
  path: string,
  authHeaders: Record<string, string>,
  body?: string
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const reqHeaders: Record<string, string> = {
      Accept: "application/json",
      Host: "brothers.skymasons.xyz",
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ calendarUri: string }> }
) {
  const headersList = await headers()
  const authHeaders = getAuthHeaders(headersList)
  if (!authHeaders) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { calendarUri } = await params

  try {
    const { status, data } = await nextcloudRequest(
      "GET",
      `/apps/skymasonsnav/api/calendar/${calendarUri}/events`,
      authHeaders
    )

    return NextResponse.json(data, { status })
  } catch (error) {
    console.error("Failed to fetch calendar events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ calendarUri: string }> }
) {
  const headersList = await headers()
  const authHeaders = getAuthHeaders(headersList)
  if (!authHeaders) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { calendarUri } = await params

  try {
    const body = await request.json()
    const { status, data } = await nextcloudRequest(
      "POST",
      `/apps/skymasonsnav/api/calendar/${calendarUri}/events`,
      authHeaders,
      JSON.stringify(body)
    )

    return NextResponse.json(data, { status })
  } catch (error) {
    console.error("Failed to create calendar event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
