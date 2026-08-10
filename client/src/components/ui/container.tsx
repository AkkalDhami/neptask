"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export function Container({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative mx-auto max-w-4xl px-2 sm:px-4", className)}>
      {children}
    </div>
  )
}
