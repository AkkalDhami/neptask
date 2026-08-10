"use client"

import { cn } from "@/lib/utils"
import { HTMLMotionProps, motion } from "motion/react"

type HeadingProps =
  | ({ as?: "h1" } & HTMLMotionProps<"h1">)
  | ({ as: "h2" } & HTMLMotionProps<"h2">)

export function Heading({
  children,
  as = "h2",
  className,
  ...props
}: HeadingProps) {
  const Tag = motion[as]

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
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={cn(
        "font-heading text-2xl font-bold sm:text-5xl",
        as === "h2" && "text-3xl font-medium sm:text-4xl sm:font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
