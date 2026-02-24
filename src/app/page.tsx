import { getUser } from "@/lib/auth"
import { getGuilds, getUserGuilds } from "@/lib/guilds"
import { HomePage } from "@/components/home/HomePage"

export default async function Home() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray">Authenticating...</p>
      </div>
    )
  }

  const [allGuilds, userGuilds] = await Promise.all([
    getGuilds(),
    getUserGuilds(),
  ])

  // Auto-join mandatory guilds the user isn't a member of yet
  const username = user.username?.toLowerCase() || ""
  for (const guild of allGuilds) {
    if (
      guild.admission === "mandatory" &&
      !guild.members.some((m: string) => m.toLowerCase() === username)
    ) {
      try {
        const { headers: h } = await import("next/headers")
        const headersList = await h()
        const authUser = headersList.get("x-authentik-username")
        const authGroups = headersList.get("x-authentik-groups")
        const authName = headersList.get("x-authentik-name")
        if (authUser) {
          const { postToNextcloud } = await import("@/lib/api")
          await postToNextcloud("/apps/skymasonsnav/api/orders/" + guild.id + "/join", {}, {
            headers: {
              "X-Authentik-Username": authUser,
              "X-Authentik-Groups": authGroups || "",
              "X-Authentik-Name": authName || "",
            },
          })
        }
      } catch {
        // Ignore join failures
      }
    }
  }

  // Collect upcoming events across all user guilds
  const eventsData: Array<{ guildId: string; guildName: string; guildColor: string; guildIcon: string; calendarUri: string }> = []
  for (const guild of userGuilds) {
    if (guild.resources.calendarUri) {
      eventsData.push({
        guildId: guild.id,
        guildName: guild.name,
        guildColor: guild.color,
        guildIcon: guild.icon,
        calendarUri: guild.resources.calendarUri,
      })
    }
  }

  return (
    <HomePage
      user={user}
      allGuilds={allGuilds}
      userGuilds={userGuilds}
      guildCalendars={eventsData}
    />
  )
}
