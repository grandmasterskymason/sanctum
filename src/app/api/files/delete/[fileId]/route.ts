import { headers } from "next/headers"
import { NextResponse, NextRequest } from "next/server"
import http from "http"

const NEXTCLOUD_URL = process.env.NEXTCLOUD_INTERNAL_URL || "http://nextcloud:80"

function deleteNC(path: string, authHeaders: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(NEXTCLOUD_URL)
    const reqOptions = {
      hostname: url.hostname,
      port: Number(url.port) || 80,
      path: path,
      method: "DELETE",
      headers: {
        "Accept": "application/json",
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const auth = await getAuthHeaders()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { fileId } = await params

  try {
    const data = await deleteNC(`/apps/skymasonsnav/api/files/${fileId}`, auth)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to delete file:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
