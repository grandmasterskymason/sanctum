import http from "http"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  const groups = headersList.get("x-authentik-groups")
  const name = headersList.get("x-authentik-name")

  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadToNextcloud(token, file.name, file.type, buffer, username, groups || "", name || "")

    return NextResponse.json(result)
  } catch (error) {
    console.error("Media upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

function uploadToNextcloud(
  token: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  username: string,
  groups: string,
  name: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const boundary = "----FormBoundary" + Math.random().toString(36).slice(2)

    const header = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
    )
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`)
    const body = Buffer.concat([header, fileBuffer, footer])

    const req = http.request(
      {
        hostname: "nextcloud",
        port: 80,
        path: `/apps/skymasonsnav/api/talk/rooms/${token}/media`,
        method: "POST",
        headers: {
          Host: "brothers.skymasons.xyz",
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length,
          "X-Authentik-Username": username,
          "X-Authentik-Groups": groups,
          "X-Authentik-Name": name,
        },
      },
      (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data))
            } catch {
              reject(new Error("Invalid JSON response"))
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`))
          }
        })
      }
    )

    req.on("error", reject)
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error("Upload timeout"))
    })
    req.write(body)
    req.end()
  })
}
