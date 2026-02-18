"use server"

import { sendMessage as sendTalkMessage } from "@/lib/talk"
import { revalidatePath } from "next/cache"

export async function sendMessage(guildId: string, token: string, message: string) {
  const result = await sendTalkMessage(token, message)
  revalidatePath(`/guild/${guildId}/pulse`)
  return result
}
