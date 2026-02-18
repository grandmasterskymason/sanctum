import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { fetchAccountAPI } from "@/lib/account-api"

export async function GET() {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const data = await fetchAccountAPI("/api/invite/link", { "X-Authentik-Username": username })
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch invite link:", error)
    return NextResponse.json({ error: "Failed to fetch invite link" }, { status: 500 })
  }
}
