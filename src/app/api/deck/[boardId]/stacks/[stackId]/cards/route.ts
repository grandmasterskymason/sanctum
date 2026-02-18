import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { postToNextcloud } from "@/lib/api"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; stackId: string }> }
) {
  const { boardId, stackId } = await params
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  const groups = headersList.get("x-authentik-groups")
  const name = headersList.get("x-authentik-name")

  if (!username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const data = await postToNextcloud(
      `/apps/skymasonsnav/api/deck/${boardId}/stacks/${stackId}/cards`,
      { title, description: description || "" },
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
    console.error("Failed to create card:", error)
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 })
  }
}
