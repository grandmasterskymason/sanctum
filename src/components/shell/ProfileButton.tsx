"use client"

import Link from "next/link"
import { useUser } from "@/lib/hooks/useUser"
import { Settings } from "lucide-react"

export function ProfileButton() {
  const { user } = useUser()

  return (
    <div className="group relative">
      <Link
        href="/settings"
        className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-150 hover:scale-110 hover:bg-black-light"
        title="Settings"
      >
        {user?.username ? (
          <img
            src={`/api/avatar/${user.username}/32`}
            alt={user.username}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <Settings className="h-5 w-5 text-gray" />
        )}
      </Link>

      {/* Tooltip */}
      <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-gray-dark bg-black px-3 py-1.5 text-sm text-white opacity-0 transition-all duration-200 group-hover:ml-3 group-hover:opacity-100">
        {user?.username || "Settings"}
      </div>
    </div>
  )
}
