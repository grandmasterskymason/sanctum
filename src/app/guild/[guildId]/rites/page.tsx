import { ChamberHeader } from "@/components/shared"
import { RitesView } from "@/components/rites/RitesView"
import { getGuild } from "@/lib/guilds"
import { getEvents } from "@/lib/calendar"
import { notFound } from "next/navigation"
import { Calendar } from "lucide-react"

interface RitesPageProps {
  params: Promise<{ guildId: string }>
}

export default async function RitesPage({ params }: RitesPageProps) {
  const { guildId } = await params
  const guild = await getGuild(guildId)

  if (!guild) {
    notFound()
  }

  const calendarUri = guild.resources.calendarUri
  const events = calendarUri ? await getEvents(calendarUri) : []

  return (
    <div className="flex h-full flex-col p-6 lg:p-8">
      <ChamberHeader
        backHref={`/guild/${guildId}`}
        icon={<Calendar className="h-10 w-10 text-guild" />}
        title="Rites"
        subtitle={`Upcoming gatherings of ${guild.name}`}
      />

      <RitesView
        guildId={guildId}
        guildName={guild.name}
        calendarUri={calendarUri}
        initialEvents={events}
        talkRoom={guild.resources.talkRoom || undefined}
        folderId={guild.resources.folderId}
        deckBoardId={guild.resources.deckBoardId}
      />
    </div>
  )
}
