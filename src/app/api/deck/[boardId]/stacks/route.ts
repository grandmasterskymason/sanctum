import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { fetchFromNextcloud } from "@/lib/api"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  const groups = headersList.get("x-authentik-groups")
  const name = headersList.get("x-authentik-name")

  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await fetchFromNextcloud(
      `/apps/skymasonsnav/api/deck/${boardId}/stacks`,
      {
        headers: {
          "X-Authentik-Username": username,
          "X-Authentik-Groups": groups || "",
          "X-Authentik-Name": name || "",
        },
      }
    )
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch stacks:", error)
    return NextResponse.json({ error: "Failed to fetch stacks" }, { status: 500 })
  }
}
