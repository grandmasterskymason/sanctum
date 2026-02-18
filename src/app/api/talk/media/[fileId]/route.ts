import http from "http"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")

  if (!username) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const result = await fetchMedia(fileId, username)
    return new NextResponse(new Uint8Array(result.data), {
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}

function fetchMedia(fileId: string, username: string): Promise<{ data: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "nextcloud",
        port: 80,
        path: `/apps/skymasonsnav/api/talk/media/${fileId}`,
        method: "GET",
        headers: {
          Host: "brothers.skymasons.xyz",
          "X-Authentik-Username": username,
        },
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on("data", (chunk) => chunks.push(chunk))
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              data: Buffer.concat(chunks),
              contentType: res.headers["content-type"] || "application/octet-stream",
            })
          } else {
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        })
      }
    )
    req.on("error", reject)
    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error("Timeout"))
    })
    req.end()
  })
}
