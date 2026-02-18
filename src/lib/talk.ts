import { headers } from "next/headers"
import { fetchFromNextcloud, postToNextcloud } from "./api"

export interface TalkRoom {
  token: string
  name: string
  type: number
  unreadMessages: number
  unreadMention: boolean
  lastActivity: number
}

export interface TalkMessage {
  id: number
  actorType: string
  actorId: string
  actorDisplayName: string
  timestamp: number
  message: string
  messageType: string
  file?: {
    id: number
    name: string
    mimetype: string
    size: number
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")
  const groups = headersList.get("x-authentik-groups")
  const name = headersList.get("x-authentik-name")

  if (!username) {
    throw new Error("Unauthorized")
  }

  return {
    "X-Authentik-Username": username,
    "X-Authentik-Groups": groups || "",
    "X-Authentik-Name": name || "",
  }
}

export async function getRooms(): Promise<TalkRoom[]> {
  try {
    const authHeaders = await getAuthHeaders()
    return await fetchFromNextcloud("/apps/skymasonsnav/api/talk/rooms", { headers: authHeaders })
  } catch (error) {
    console.error("Failed to fetch Talk rooms:", error)
    return []
  }
}

export async function getMessages(token: string, limit = 50): Promise<TalkMessage[]> {
  try {
    const authHeaders = await getAuthHeaders()
    return await fetchFromNextcloud(
      `/apps/skymasonsnav/api/talk/rooms/${token}/messages?limit=${limit}`,
      { headers: authHeaders }
    )
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return []
  }
}

export async function sendMessage(token: string, message: string): Promise<TalkMessage | null> {
  try {
    const authHeaders = await getAuthHeaders()
    return await postToNextcloud(
      `/apps/skymasonsnav/api/talk/rooms/${token}/messages`,
      { message },
      { headers: authHeaders }
    )
  } catch (error) {
    console.error("Failed to send message:", error)
    return null
  }
}
