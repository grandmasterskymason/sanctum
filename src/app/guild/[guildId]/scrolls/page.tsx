import { getGuild } from "@/lib/guilds"
import { notFound } from "next/navigation"
import { ScrollsView } from "@/components/scrolls/ScrollsView"

interface ScrollsPageProps {
  params: Promise<{ guildId: string }>
}

export default async function ScrollsPage({ params }: ScrollsPageProps) {
  const { guildId } = await params
  const guild = await getGuild(guildId)

  if (!guild) {
    notFound()
  }

  return <ScrollsView guildId={guildId} guildName={guild.name} />
}
