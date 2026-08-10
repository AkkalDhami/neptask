"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="md:size-8"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        <IconSun className="h-[1.2rem] w-[1.2rem] scale-0 -rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <IconMoon className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
