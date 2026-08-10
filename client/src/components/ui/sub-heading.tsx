"use client"

import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import React from "react"

export function SubHeading({
  children,
  as = "p",
  className,
}: {
  children: React.ReactNode
  as?: "h3" | "p" | "div"
  className?: string
}) {
  const Tag = motion[as] || "h3"
  return (
    <Tag
      initial={{
        opacity: 0,
        filter: "blur(10px)",
      }}
      whileInView={{
        opacity: 1,
        filter: "blur(0px)",
      }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        ease: "easeInOut",
      }}
      className={cn(
        "animate-fade-in-blur max-w-3xl text-base text-muted-foreground sm:text-lg",
        as === "h3" && "font-medium",
        className
      )}
    >
      {children}
    </Tag>
  )
}
