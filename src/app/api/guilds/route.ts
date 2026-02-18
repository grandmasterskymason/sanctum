import { headers } from "next/headers"
import { NextResponse } from "next/server"

const NEXTCLOUD_URL = process.env.NEXTCLOUD_INTERNAL_URL || "http://nextcloud:80"

export async function GET() {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  const groups = headersList.get("x-authentik-groups")
  const name = headersList.get("x-authentik-name")

  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const response = await fetch(`${NEXTCLOUD_URL}/apps/skymasonsnav/api/orders`, {
      headers: {
        "X-Authentik-Username": username,
        "X-Authentik-Groups": groups || "",
        "X-Authentik-Name": name || "",
        "Host": "brothers.skymasons.xyz",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`Nextcloud API error: ${response.status}`)
      throw new Error(`API responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data.orders || data)
  } catch (error) {
    console.error("Failed to fetch guilds:", error)
    return NextResponse.json({ error: "Failed to fetch guilds" }, { status: 500 })
  }
}
