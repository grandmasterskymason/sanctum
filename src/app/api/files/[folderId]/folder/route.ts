import { headers } from "next/headers"
import { NextResponse, NextRequest } from "next/server"
import http from "http"

const NEXTCLOUD_URL = process.env.NEXTCLOUD_INTERNAL_URL || "http://nextcloud:80"

function postNC(path: string, authHeaders: Record<string, string>, body: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(NEXTCLOUD_URL)
    const bodyBuf = Buffer.from(body)
    const reqOptions = {
      hostname: url.hostname,
      port: Number(url.port) || 80,
      path: path,
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Content-Length": bodyBuf.length,
        "Host": "brothers.skymasons.xyz",
        ...authHeaders,
      },
    }

    const req = http.request(reqOptions, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data))
          } catch {
            resolve({ success: true })
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`))
        }
      })
    })

    req.on("error", reject)
    req.write(bodyBuf)
    req.end()
  })
}

async function getAuthHeaders() {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  const groups = headersList.get("x-authentik-groups")
  const name = headersList.get("x-authentik-name")

  if (!username) return null

  return {
    "X-Authentik-Username": username,
    "X-Authentik-Groups": groups || "",
    "X-Authentik-Name": name || "",
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const auth = await getAuthHeaders()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { folderId } = await params

  try {
    const { name } = await request.json()
    if (!name) {
      return NextResponse.json({ error: "Folder name required" }, { status: 400 })
    }

    const data = await postNC(
      `/apps/skymasonsnav/api/files/${folderId}/folder`,
      auth,
      JSON.stringify({ name })
    )
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to create folder:", error)
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 })
  }
}
