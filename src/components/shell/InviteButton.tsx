"use client"

import { useState } from "react"
import { UserPlus, Copy, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function InviteButton() {
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    if (open) {
      setOpen(false)
      return
    }

    setOpen(true)
    if (!link) {
      setLoading(true)
      try {
        const res = await fetch("/api/invite")
        const data = await res.json()
        if (data.invite_url) {
          setLink(data.invite_url)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCopy = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-150",
          "text-gray hover:scale-110 hover:bg-black-light hover:text-gold",
          open && "bg-black-light text-gold"
        )}
        title="Invite someone"
      >
        <UserPlus className="h-5 w-5" />
      </button>

      {/* Tooltip */}
      {!open && (
        <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-gray-dark bg-black px-3 py-1.5 text-sm text-white opacity-0 transition-all duration-200 group-hover:ml-3 group-hover:opacity-100">
          Invite
        </div>
      )}

      {/* Popover */}
      {open && (
        <div className="absolute bottom-0 left-full z-50 ml-3 w-72 rounded-lg border border-gray-dark bg-black-deep p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold tracking-wide text-white">
              Invite to Sanctum
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-3 text-xs text-gray">
            Share this link to invite someone to join the Sanctum.
          </p>

          {loading ? (
            <div className="py-2 text-center text-sm text-gray">Loading...</div>
          ) : link ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={link}
                className="min-w-0 flex-1 rounded-md border border-gray-dark bg-black px-3 py-2 text-xs text-white"
              />
              <button
                onClick={handleCopy}
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md transition-colors",
                  copied
                    ? "bg-success/20 text-success"
                    : "bg-guild/10 text-guild hover:bg-guild/20"
                )}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <div className="py-2 text-center text-sm text-danger">Failed to load invite link</div>
          )}
        </div>
      )}
    </div>
  )
}
