import { getGuild } from "@/lib/guilds"
import { notFound } from "next/navigation"
import { ArchiveBrowser } from "@/components/archive/ArchiveBrowser"

interface ArchivePageProps {
  params: Promise<{ guildId: string }>
}

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { guildId } = await params
  const guild = await getGuild(guildId)

  if (!guild) {
    notFound()
  }

  return (
    <ArchiveBrowser
      guildId={guildId}
      guildName={guild.name}
      folderId={guild.resources.folderId}
    />
  )
}
