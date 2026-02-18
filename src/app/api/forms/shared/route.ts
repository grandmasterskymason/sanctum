import { headers } from "next/headers"
import { NextResponse } from "next/server"
import http from "http"

export async function GET() {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")

  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const authHeaders: Record<string, string> = {
    "X-Authentik-Username": username,
    "X-Authentik-Groups": headersList.get("x-authentik-groups") || "",
    "X-Authentik-Name": headersList.get("x-authentik-name") || "",
  }

  try {
    const data = await new Promise<any>((resolve, reject) => {
      const req = http.request(
        {
          hostname: "nextcloud",
          port: 80,
          path: "/apps/skymasonsnav/api/forms/shared",
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Host": "brothers.skymasons.xyz",
            ...authHeaders,
          },
        },
        (res) => {
          let body = ""
          res.on("data", (chunk) => (body += chunk))
          res.on("end", () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(body))
              } catch {
                reject(new Error("Invalid JSON response"))
              }
            } else {
              reject(new Error(`HTTP ${res.statusCode}`))
            }
          })
        }
      )
      req.on("error", reject)
      req.end()
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch shared forms:", error)
    return NextResponse.json({ error: "Failed to fetch shared forms" }, { status: 500 })
  }
}
