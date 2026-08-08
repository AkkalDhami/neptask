import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-12 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="my-6 text-7xl font-bold">NepTask</h1>
      <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
        <Link
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] md:w-39.5 dark:hover:bg-[#ccc]"
          href="/signup"
          rel="noopener noreferrer"
        >
          Signup
        </Link>
        <Link
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] md:w-39.5 dark:hover:bg-[#ccc]"
          href="/signin"
          rel="noopener noreferrer"
        >
          Signin
        </Link>
      </div>

    </div>
  )
}
