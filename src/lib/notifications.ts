import { getRooms } from "./talk"
import { getEvents, CalendarEvent } from "./calendar"
import { getStacks } from "./deck"
import type { Guild } from "@/types/guild"

export interface ChamberNotifications {
  pulse?: number
  rites?: number
  quests?: number
}

export async function getChamberNotifications(
  guild: Guild,
  username: string
): Promise<ChamberNotifications> {
  const results = await Promise.allSettled([
    // Unread messages from Talk
    guild.resources.talkRoom ? getRooms() : Promise.resolve([]),
    // Upcoming events
    guild.resources.calendarUri
      ? getEvents(guild.resources.calendarUri)
      : Promise.resolve([]),
    // Active quests
    guild.resources.deckBoardId
      ? getStacks(guild.resources.deckBoardId)
      : Promise.resolve([]),
  ])

  const notifications: ChamberNotifications = {}

  // Pulse: unread message count for this guild's talk room
  if (results[0].status === "fulfilled" && guild.resources.talkRoom) {
    const rooms = results[0].value
    const room = rooms.find((r) => r.token === guild.resources.talkRoom)
    if (room && room.unreadMessages > 0) {
      notifications.pulse = room.unreadMessages
    }
  }

  // Rites: events within next 7 days
  if (results[1].status === "fulfilled") {
    const events = results[1].value as CalendarEvent[]
    const now = new Date()
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const upcoming = events.filter((e) => {
      const start = new Date(e.start)
      return start > now && start < in7Days
    })
    if (upcoming.length > 0) {
      notifications.rites = upcoming.length
    }
  }

  // Quests: cards assigned to user or overdue
  if (results[2].status === "fulfilled") {
    const stacks = results[2].value
    const now = new Date()
    let count = 0
    for (const stack of stacks) {
      for (const card of stack.cards) {
        const isAssigned = card.assignedUsers.includes(username)
        const isOverdue =
          card.duedate !== null && new Date(card.duedate) < now
        if (isAssigned || isOverdue) {
          count++
        }
      }
    }
    if (count > 0) {
      notifications.quests = count
    }
  }

  return notifications
}
