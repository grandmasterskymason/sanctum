import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { fetchAccountAPI } from "@/lib/account-api"

export async function GET() {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const data = await fetchAccountAPI("/api/invite/referrals", { "X-Authentik-Username": username })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ referrals: [], count: 0 })
  }
}
