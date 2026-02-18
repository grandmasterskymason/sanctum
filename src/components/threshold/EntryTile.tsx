import Link from "next/link"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EntryTileProps {
  href: string
  icon: LucideIcon
  title: string
  description: string
  badge?: number
  external?: boolean
}

export function EntryTile({ href, icon: Icon, title, description, badge, external }: EntryTileProps) {
  const Wrapper = external ? "a" : Link
  const linkProps = external
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : { href }

  return (
    <Wrapper
      {...linkProps}
      className={cn(
        "group relative block rounded-lg bg-black-light p-5",
        "border border-gray-dark transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-guild/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-guild/10">
          <Icon className="h-4 w-4 text-guild" />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-guild px-1 text-[10px] font-bold leading-none text-black-deep">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </div>
        <span className="font-display text-sm font-medium tracking-wide text-white transition-colors group-hover:text-guild">
          {title}
        </span>
      </div>
      <p className="mt-3 text-sm text-gray">{description}</p>
    </Wrapper>
  )
}
