"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import type { Guild } from "@/types/guild"

export function useGuilds() {
  const { data, error, isLoading, mutate } = useSWR<Guild[]>(
    "/api/guilds",
    fetcher
  )

  return {
    guilds: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useGuild(guildId: string) {
  const { guilds, isLoading, isError } = useGuilds()
  const guild = guilds.find(o => o.id === guildId)

  return {
    guild,
    isLoading,
    isError,
  }
}
