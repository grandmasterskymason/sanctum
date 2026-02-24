"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, LayoutGroup } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Guild } from "@/types/guild"
import { InviteButton } from "./InviteButton"

const PINNED_GUILD = "The Brotherhood"
const STORAGE_KEY = "guild-access-order"

interface SidebarProps {
  guilds: Guild[]
}

function getAccessOrder(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

function recordAccess(guildId: string) {
  const order = getAccessOrder().filter((id) => id !== guildId)
  order.unshift(guildId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order.slice(0, 20)))
}

export function Sidebar({ guilds }: SidebarProps) {
  const pathname = usePathname()
  const currentGuildId = pathname.match(/\/guild\/([^/]+)/)?.[1]
  const [accessOrder, setAccessOrder] = useState<string[]>([])

  // Load access order from localStorage on mount
  useEffect(() => {
    setAccessOrder(getAccessOrder())
  }, [])

  // Record access when guild changes
  useEffect(() => {
    if (currentGuildId) {
      const guild = guilds.find((g) => g.id === currentGuildId)
      if (guild && guild.name !== PINNED_GUILD) {
        recordAccess(currentGuildId)
        setAccessOrder(getAccessOrder())
      }
    }
  }, [currentGuildId, guilds])

  const sortedGuilds = [...guilds].sort((a, b) => {
    // Pin The Brotherhood to top
    if (a.name === PINNED_GUILD) return -1
    if (b.name === PINNED_GUILD) return 1
    // Then sort by recent access
    const aIdx = accessOrder.indexOf(a.id)
    const bIdx = accessOrder.indexOf(b.id)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return 0
  })

  return (
    <aside className="flex h-screen w-[72px] flex-col items-center border-r border-gray-dark bg-black-deep py-4">
      {/* Logo */}
      <Link
        href="/"
        className="mb-6 flex h-12 w-12 items-center justify-center transition-opacity hover:opacity-80"
      >
        <Image
          src="/logo.jpg"
          alt="Skymasons"
          width={40}
          height={40}
          className="rounded-full"
        />
      </Link>

      {/* Divider */}
      <div className="mb-4 h-px w-8 bg-gray-dark" />

      {/* Guild Icons */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        <LayoutGroup>
          {sortedGuilds.map((guild) => (
            <SidebarItem
              key={guild.id}
              guild={guild}
              isActive={currentGuildId === guild.id}
            />
          ))}
        </LayoutGroup>
      </nav>

      {/* Bottom actions */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="mb-2 h-px w-8 bg-gray-dark" />
        <div className="group relative">
          <InviteButton />
        </div>
      </div>
    </aside>
  )
}

interface SidebarItemProps {
  guild: Guild
  isActive: boolean
}

function SidebarItem({ guild, isActive }: SidebarItemProps) {
  return (
    <motion.div
      layout
      layoutId={guild.id}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="group relative"
    >
      <Link
        href={`/guild/${guild.id}`}
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all duration-150",
          "hover:scale-110 hover:bg-black-light",
          isActive && "bg-black-light"
        )}
        style={{
          boxShadow: isActive ? `inset 0 0 0 2px ${guild.color}` : "none",
        }}
        title={guild.name}
      >
        {/* Active indicator pip */}
        {isActive && (
          <motion.div
            layoutId="active-pip"
            className="absolute -left-[5px] top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: guild.color }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        )}
        <span style={{ color: guild.color }}>{guild.icon?.startsWith("data:") ? <img src={guild.icon} alt="" className="h-5 w-5 object-contain" /> : guild.icon}</span>
      </Link>

      {/* Tooltip */}
      <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-gray-dark bg-black px-3 py-1.5 text-sm text-white opacity-0 transition-all duration-200 group-hover:ml-3 group-hover:opacity-100">
        {guild.name}
      </div>
    </motion.div>
  )
}
