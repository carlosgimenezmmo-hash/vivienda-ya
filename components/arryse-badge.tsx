"use client"

import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ArryseBadgeProps {
  mode?: "clasico" | "express" | "pro"
  size?: "sm" | "md"
  className?: string
}

export function ArryseBadge({ mode = "clasico", size = "sm", className }: ArryseBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        "animate-pulse-glow",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-3 py-1 text-xs",
        mode === "pro"
          ? "bg-vy-gold/90 text-black"
          : "bg-vy-green/90 text-white",
        className
      )}
    >
      <ShieldCheck className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>GPS</span>
      {mode === "pro" && <span>PRO</span>}
    </span>
  )
}
