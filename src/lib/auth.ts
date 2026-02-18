import { headers } from "next/headers"

export interface User {
  username: string
  name: string
  email: string
  groups: string[]
  avatar: string
}

export async function getUser(): Promise<User | null> {
  const headersList = await headers()
  
  const username = headersList.get("x-authentik-username")
  const name = headersList.get("x-authentik-name")
  const email = headersList.get("x-authentik-email")
  const groupsStr = headersList.get("x-authentik-groups")

  if (!username) {
    return null
  }

  return {
    username,
    name: name || username,
    email: email || "",
    groups: groupsStr ? groupsStr.split(",") : [],
    avatar: `/api/avatar/${username}/64`,
  }
}

export function isGrandmaster(user: User): boolean {
  return user.groups.some(g => 
    g.toLowerCase().includes("grandmaster") || 
    g.toLowerCase().includes("admin")
  )
}

export function isElder(user: User): boolean {
  return user.groups.some(g => g.toLowerCase().includes("elder"))
}
