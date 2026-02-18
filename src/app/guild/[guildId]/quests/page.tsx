import { getGuild } from "@/lib/guilds"
import { getStacks } from "@/lib/deck"
import { notFound } from "next/navigation"
import { QuestBoard } from "@/components/quests/QuestBoard"

interface QuestsPageProps {
  params: Promise<{ guildId: string }>
}

export default async function QuestsPage({ params }: QuestsPageProps) {
  const { guildId } = await params
  const guild = await getGuild(guildId)

  if (!guild) {
    notFound()
  }

  const boardId = guild.resources.deckBoardId
  const stacks = boardId ? await getStacks(boardId) : []

  return (
    <QuestBoard
      guildId={guildId}
      guildName={guild.name}
      boardId={boardId}
      initialStacks={stacks}
    />
  )
}
