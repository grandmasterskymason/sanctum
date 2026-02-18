import { redirect } from "next/navigation"
import { getUserGuilds } from "@/lib/guilds"
import { getUser } from "@/lib/auth"

export default async function Home() {
  const user = await getUser()
  
  // If not authenticated, the auth proxy will handle redirect
  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray">Authenticating...</p>
      </div>
    )
  }

  const guilds = await getUserGuilds()

  // Redirect to first guild if available
  if (guilds.length > 0) {
    redirect(`/guild/${guilds[0].id}`)
  }

  // No guilds - show message
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <p className="text-lg text-white">Welcome, {user.name}</p>
      <p className="mt-2 text-gray">You are not a member of any guilds yet.</p>
    </div>
  )
}
