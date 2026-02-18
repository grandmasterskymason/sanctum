import { headers } from "next/headers"
import { NextResponse, NextRequest } from "next/server"
import { fetchAccountAPI } from "@/lib/account-api"

export async function DELETE(request: NextRequest) {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const data = await fetchAccountAPI(
      "/api/account/delete",
      { "X-Authentik-Username": username },
      { method: "DELETE", body: JSON.stringify(body) }
    )
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to delete account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
