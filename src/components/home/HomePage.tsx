"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calendar, Users, Plus, Shield, ChevronRight, Clock,
  X, Check, Loader2, Search, Sparkles
} from "lucide-react"
import type { Guild } from "@/types/guild"
import type { User } from "@/lib/auth"

interface GuildCalendar {
  guildId: string
  guildName: string
  guildColor: string
  calendarUri: string
}

interface UpcomingEvent {
  uid: string
  title: string
  start: string
  end: string | null
  guildId: string
  guildName: string
  guildColor: string
}

interface HomePageProps {
  user: User
  allGuilds: Guild[]
  userGuilds: Guild[]
  guildCalendars: GuildCalendar[]
}

export function HomePage({ user, allGuilds, userGuilds, guildCalendars }: HomePageProps) {
  const [events, setEvents] = useState<UpcomingEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [showCreateGuild, setShowCreateGuild] = useState(false)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"my" | "discover">("my")

  const username = user.username?.toLowerCase() || ""

  useEffect(() => {
    async function loadEvents() {
      setLoadingEvents(true)
      const now = new Date()
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const from = now.toISOString().split("T")[0]
      const to = in30Days.toISOString().split("T")[0]

      const results = await Promise.allSettled(
        guildCalendars.map(async (gc) => {
          const res = await fetch(`/api/calendar/${gc.calendarUri}/events?from=${from}&to=${to}`)
          if (!res.ok) return []
          const data = await res.json()
          return (Array.isArray(data) ? data : []).map((e: any) => ({
            ...e,
            guildId: gc.guildId,
            guildName: gc.guildName,
            guildColor: gc.guildColor,
          }))
        })
      )

      const allEvents: UpcomingEvent[] = []
      for (const r of results) {
        if (r.status === "fulfilled") allEvents.push(...r.value)
      }

      allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      setEvents(allEvents)
      setLoadingEvents(false)
    }

    if (guildCalendars.length > 0) {
      loadEvents()
    } else {
      setLoadingEvents(false)
    }
  }, [guildCalendars])

  const otherGuilds = allGuilds.filter(
    (g) => !g.members.some((m) => m.toLowerCase() === username) && g.admission !== "mandatory"
  )

  const filteredGuilds = (tab === "my" ? userGuilds : otherGuilds)
    .filter((g) => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))

  return (
    <div className="atmosphere flex h-full flex-col overflow-y-auto">
      {/* Hero welcome */}
      <div className="relative border-b border-gray-dark/50 px-6 pb-8 pt-8 lg:px-8">
        <div className="relative z-10">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-gray">
            Per aspera ad astra
          </p>
          <h1 className="font-display text-3xl font-medium tracking-wide text-gold">
            Welcome, {user.name || user.username}
          </h1>
          <p className="mt-2 text-sm text-gray-light">The Sanctum awaits your counsel</p>
        </div>
        {/* Subtle gold gradient wash */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gold/[0.03] to-transparent" />
      </div>

      <div className="flex-1 space-y-0 px-6 lg:px-8">
        {/* Upcoming Rites */}
        <section className="py-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
              <Calendar className="h-4 w-4 text-gold" />
            </div>
            <div>
              <h2 className="font-display text-base font-medium tracking-wide text-white">
                Upcoming Rites
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-gray">Across all your guilds</p>
            </div>
          </div>
          {loadingEvents ? (
            <div className="flex items-center gap-2 py-6 text-sm text-gray">
              <Loader2 className="h-4 w-4 animate-spin" /> Consulting the stars...
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-dark/70 py-8 text-center">
              <Calendar className="mx-auto mb-2 h-6 w-6 text-gray-dark" />
              <p className="text-sm italic text-gray">No rites foretold in the coming days</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {events.slice(0, 8).map((event) => (
                <EventCard key={`${event.guildId}-${event.uid}`} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="glow-line relative h-px" />

        {/* Guilds */}
        <section className="py-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
                <Shield className="h-4 w-4 text-gold" />
              </div>
              <div>
                <h2 className="font-display text-base font-medium tracking-wide text-white">
                  The Guilds
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-gray">Brotherhoods of the order</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateGuild(true)}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/5 px-3.5 py-2 text-xs font-medium text-gold transition-all hover:border-gold/60 hover:bg-gold/10"
            >
              <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
              Seed Guild
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex items-center gap-4 border-b border-gray-dark/50">
            <button
              onClick={() => setTab("my")}
              className={`relative pb-3 text-xs font-medium tracking-wider transition-colors ${
                tab === "my" ? "text-gold" : "text-gray hover:text-white"
              }`}
            >
              MY GUILDS
              <span className="ml-1.5 text-[10px] text-gray">({userGuilds.length})</span>
              {tab === "my" && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
              )}
            </button>
            <button
              onClick={() => setTab("discover")}
              className={`relative pb-3 text-xs font-medium tracking-wider transition-colors ${
                tab === "discover" ? "text-gold" : "text-gray hover:text-white"
              }`}
            >
              DISCOVER
              <span className="ml-1.5 text-[10px] text-gray">({otherGuilds.length})</span>
              {tab === "discover" && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
              )}
            </button>
            {/* Search aligned right */}
            <div className="ml-auto pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-36 rounded border border-gray-dark/50 bg-transparent py-1 pl-7 pr-2 text-[11px] text-white placeholder:text-gray focus:border-gold/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Guild Grid */}
          {filteredGuilds.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-dark/70 py-10 text-center">
              <Shield className="mx-auto mb-2 h-6 w-6 text-gray-dark" />
              <p className="text-sm italic text-gray">
                {search ? "No guilds match your search" : tab === "my" ? "You have not yet pledged to any guild" : "All guilds have been claimed"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredGuilds.map((guild) => (
                <GuildTile
                  key={guild.id}
                  guild={guild}
                  username={username}
                  isMember={guild.members.some((m) => m.toLowerCase() === username)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Guild Modal */}
      {showCreateGuild && (
        <CreateGuildModal onClose={() => setShowCreateGuild(false)} />
      )}
    </div>
  )
}

function EventCard({ event }: { event: UpcomingEvent }) {
  const date = new Date(event.start)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  const dayLabel = isToday
    ? "Today"
    : isTomorrow
    ? "Tomorrow"
    : date.toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" })

  const timeLabel = date.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true })

  return (
    <Link
      href={`/guild/${event.guildId}/rites`}
      className="ornate-border group relative min-w-[220px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-b from-black-light to-black p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/5"
    >
      <div className="ornate-corner ornate-corner-tl" />
      <div className="ornate-corner ornate-corner-tr" />
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <div
            className="h-1.5 w-1.5 rounded-full shadow-sm"
            style={{ backgroundColor: event.guildColor || "#c9a227", boxShadow: `0 0 6px ${event.guildColor || "#c9a227"}40` }}
          />
          <span className="text-[10px] font-medium uppercase tracking-widest text-gray">
            {event.guildName}
          </span>
        </div>
        <h3 className="font-display text-sm font-medium tracking-wide text-white group-hover:text-gold">
          {event.title}
        </h3>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray">
          <Clock className="h-3 w-3" />
          <span className={isToday ? "font-medium text-gold" : ""}>
            {dayLabel}, {timeLabel}
          </span>
        </div>
      </div>
      {/* Subtle glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-gold/0 transition-colors group-hover:bg-gold/[0.02]" />
    </Link>
  )
}

function GuildTile({
  guild,
  username,
  isMember,
}: {
  guild: Guild
  username: string
  isMember: boolean
}) {
  const [acting, setActing] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)
  const isPending = guild.pending?.some((p) => p.toLowerCase() === username)
  const isSeeder = guild.seederUid?.toLowerCase() === username

  const handleAction = async (action: string) => {
    setActing(true)
    try {
      const res = await fetch(`/api/guilds/${guild.id}?action=${action}`, { method: "POST" })
      if (!res.ok) throw new Error()
      setActionResult(action === "join" ? "Joined!" : action === "apply" ? "Applied!" : "Left")
    } catch {
      setActionResult("Failed")
    } finally {
      setActing(false)
    }
  }

  const guildColor = guild.color || "#c9a227"

  const cardContent = (
    <>
      {/* Color accent bar at top */}
      <div className="h-1 w-full rounded-t-lg" style={{ backgroundColor: guildColor }} />

      <div className="flex flex-col items-center px-4 pb-4 pt-5">
        {/* Emblem */}
        <div
          className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: guildColor + "18", color: guildColor }}
        >
          {guild.icon || "\u2B21"}
        </div>

        {/* Name */}
        <h3 className="mb-1 text-center font-display text-sm font-medium tracking-wide text-white transition-colors group-hover:text-gold">
          {guild.name}
        </h3>

        {/* Description */}
        {guild.description ? (
          <p className="mb-3 line-clamp-2 text-center text-[11px] leading-relaxed text-gray">
            {guild.description}
          </p>
        ) : (
          <div className="mb-3" />
        )}

        {/* Member count */}
        <div className="mb-3 flex items-center gap-1.5 text-[11px] text-gray-light">
          <Users className="h-3 w-3" />
          <span>{guild.memberCount || 0} {(guild.memberCount || 0) === 1 ? "member" : "members"}</span>
        </div>

        {/* Badges */}
        {isSeeder && (
          <span className="mb-3 rounded bg-gold/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-gold-dim">
            Seeder
          </span>
        )}

        {/* Action */}
        <div className="mt-auto w-full">
          {isMember ? (
            <span className="flex w-full items-center justify-center gap-1 rounded-lg bg-gold/10 py-2 text-xs font-medium text-gold transition-colors group-hover:bg-gold/20">
              Enter <ChevronRight className="h-3 w-3" />
            </span>
          ) : actionResult ? (
            <span className="block w-full py-2 text-center text-xs text-success">{actionResult}</span>
          ) : isPending ? (
            <span className="block w-full py-2 text-center text-[11px] italic text-gold-dim">Pending</span>
          ) : guild.admission === "open" ? (
            <button
              onClick={(e) => { e.preventDefault(); handleAction("join") }}
              disabled={acting}
              className="w-full rounded-lg bg-gold/10 py-2 text-xs font-medium text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
            >
              {acting ? "..." : "Join Guild"}
            </button>
          ) : (
            <button
              onClick={(e) => { e.preventDefault(); handleAction("apply") }}
              disabled={acting}
              className="w-full rounded-lg border border-gold/20 py-2 text-xs font-medium text-gold transition-colors hover:bg-gold/10 disabled:opacity-50"
            >
              {acting ? "..." : "Apply"}
            </button>
          )}
        </div>
      </div>
    </>
  )

  if (isMember) {
    return (
      <Link
        href={`/guild/${guild.id}`}
        className="group flex flex-col overflow-hidden rounded-lg border border-gray-dark/40 bg-black-light/50 transition-all hover:-translate-y-0.5 hover:border-gray-dark hover:bg-black-light hover:shadow-lg hover:shadow-gold/5"
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-dark/40 bg-black-light/50 transition-all hover:-translate-y-0.5 hover:border-gray-dark hover:bg-black-light hover:shadow-lg hover:shadow-gold/5">
      {cardContent}
    </div>
  )
}

const GUILD_ICONS = ["\u2B21", "\u2726", "\u2727", "\u269B", "\u2694", "\u2698", "\u2693", "\u2625", "\u262F", "\u2604", "\u2618", "\u2622", "\u2640", "\u2642", "\u26A1", "\u2B50", "\u2744", "\u2756"]
const GUILD_COLORS = ["#c9a227", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#e67e22", "#1abc9c", "#f39c12"]

function CreateGuildModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("\u2B21")
  const [color, setColor] = useState("#c9a227")
  const [admission, setAdmission] = useState<"open" | "closed">("open")
  const [createChat, setCreateChat] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setCreating(true)
    setError(null)

    try {
      const res = await fetch("/api/guilds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon,
          color,
          admission,
          createChat,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create guild")
      }

      const guild = await res.json()
      window.location.href = `/guild/${guild.id}`
    } catch (err: any) {
      setError(err.message || "Failed to create guild")
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-deep/90 p-4 backdrop-blur-sm">
      <div className="ornate-border relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-gradient-to-b from-black-light to-black p-6">
        <div className="ornate-corner ornate-corner-tl" />
        <div className="ornate-corner ornate-corner-tr" />
        <div className="ornate-corner ornate-corner-bl" />
        <div className="ornate-corner ornate-corner-br" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-medium tracking-wide text-gold">Seed a Guild</h2>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-gray">Plant the seed of brotherhood</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-gray transition-colors hover:bg-white/5 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-gray">
                Guild Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Guild of the..."
                required
                maxLength={50}
                autoFocus
                className="w-full rounded-lg border border-gray-dark bg-black px-3 py-2.5 text-sm text-white placeholder:text-gray focus:border-gold/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-gray">
                Purpose
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What calling does this guild answer?"
                maxLength={2000}
                rows={3}
                className="w-full rounded-lg border border-gray-dark bg-black px-3 py-2.5 text-sm text-white placeholder:text-gray focus:border-gold/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-gray">
                  Emblem
                </label>
                <div className="flex flex-wrap gap-1">
                  {GUILD_ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`flex h-8 w-8 items-center justify-center rounded text-base transition-all ${
                        icon === i
                          ? "bg-gold/15 ring-1 ring-gold/50 scale-110"
                          : "bg-black hover:bg-white/5"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-gray">
                  Color
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GUILD_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded transition-all ${
                        color === c ? "scale-110 ring-2 ring-white/80 ring-offset-1 ring-offset-black" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-gray">
                Admission
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdmission("open")}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-xs transition-all ${
                    admission === "open"
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-gray-dark text-gray hover:border-gray hover:text-white"
                  }`}
                >
                  <span className="block font-medium">Open Gate</span>
                  <span className="mt-0.5 block text-[10px] opacity-60">Anyone may enter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdmission("closed")}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-xs transition-all ${
                    admission === "closed"
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-gray-dark text-gray hover:border-gray hover:text-white"
                  }`}
                >
                  <span className="block font-medium">Sealed Gate</span>
                  <span className="mt-0.5 block text-[10px] opacity-60">By application only</span>
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-dark/50 px-3 py-2.5 transition-colors hover:border-gray-dark">
              <input
                type="checkbox"
                checked={createChat}
                onChange={(e) => setCreateChat(e.target.checked)}
                className="h-4 w-4 rounded border-gray-dark bg-black text-gold focus:ring-gold"
              />
              <div>
                <span className="block text-xs text-gray-light">Create The Pulse</span>
                <span className="block text-[10px] text-gray">A chat room for the guild</span>
              </div>
            </label>

            {error && <p className="text-xs text-danger">{error}</p>}

            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="w-full rounded-lg bg-gradient-to-r from-gold to-gold-dim py-3 text-sm font-medium tracking-wide text-black-deep transition-all hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50"
            >
              {creating ? "Planting the Seed..." : "Seed Guild"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
