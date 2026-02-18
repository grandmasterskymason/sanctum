import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  as?: "div" | "a"
  href?: string
}

export function Card({ children, className, as = "div", href }: CardProps) {
  const baseStyles = cn(
    "group rounded-lg border border-gray-dark bg-black-light p-4",
    "transition-all duration-200 hover:border-guild/50",
    className
  )

  if (as === "a" && href) {
    return (
      <a href={href} className={baseStyles}>
        {children}
      </a>
    )
  }

  return <div className={baseStyles}>{children}</div>
}

interface CardIconProps {
  children: ReactNode
  className?: string
}

export function CardIcon({ children, className }: CardIconProps) {
  return (
    <div className={cn(
      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-guild/10",
      className
    )}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn(
      "font-medium text-white transition-colors group-hover:text-guild",
      className
    )}>
      {children}
    </h3>
  )
}
