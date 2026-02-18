import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  const groups = headersList.get("x-authentik-groups")
  const name = headersList.get("x-authentik-name")
  const email = headersList.get("x-authentik-email")

  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    username,
    name: name || username,
    email: email || "",
    groups: groups ? groups.split(",") : [],
    avatar: `/api/avatar/${username}/64`,
  })
}
