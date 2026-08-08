"use client"

import React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className={`relative my-5 w-full max-w-md`}>{children}</div>
    </div>
  )
}
