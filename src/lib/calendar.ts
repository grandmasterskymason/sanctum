import { headers } from "next/headers"
import { fetchFromNextcloud } from "./api"

export interface CalendarEvent {
  uid: string
  title: string
  start: string
  end: string | null
  allDay?: boolean
  location?: string
  description?: string
  recurrence?: string
  status?: string
  categories?: string
  links?: Array<{ type: string; label: string; url: string }>
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

export async function getEvents(calendarUri: string): Promise<CalendarEvent[]> {
  try {
    const authHeaders = await getAuthHeaders()
    return await fetchFromNextcloud(
      `/apps/skymasonsnav/api/calendar/${calendarUri}/events`,
      { headers: authHeaders }
    )
  } catch (error) {
    console.error("Failed to fetch calendar events:", error)
    return []
  }
}
