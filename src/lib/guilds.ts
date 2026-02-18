import { headers } from "next/headers"
import { fetchFromNextcloud } from "./api"
import type { Guild } from "@/types/guild"

export async function getGuilds(): Promise<Guild[]> {
  const headersList = await headers()

  const username = headersList.get("x-authentik-username")
  const groups = headersList.get("x-authentik-groups")
  const name = headersList.get("x-authentik-name")

  if (!username) {
    return []
  }

  try {
    const data = await fetchFromNextcloud("/apps/skymasonsnav/api/orders", {
      headers: {
        "X-Authentik-Username": username,
        "X-Authentik-Groups": groups || "",
        "X-Authentik-Name": name || "",
      },
    })
    return data.orders || []
  } catch (error) {
    console.error("Error fetching guilds:", error)
    return []
  }
}

export async function getGuild(guildId: string): Promise<Guild | null> {
  const guilds = await getGuilds()
  return guilds.find(o => o.id === guildId) || null
}

export async function getUserGuilds(): Promise<Guild[]> {
  const headersList = await headers()
  const username = headersList.get("x-authentik-username")

  if (!username) {
    return []
  }

  const guilds = await getGuilds()
  return guilds.filter(o => o.members.includes(username) || o.admission === "mandatory")
}
