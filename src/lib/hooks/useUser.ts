"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import type { User } from "@/types/user"

export function useUser() {
  const { data, error, isLoading } = useSWR<User>(
    "/api/userinfo",
    fetcher
  )

  return {
    user: data,
    isLoading,
    isError: error,
  }
}
