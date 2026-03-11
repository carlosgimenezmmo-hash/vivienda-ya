import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function HighlightedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-vy-gold/90 px-2.5 py-1 text-[10px] font-bold text-black",
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      DESTACADO
    </span>
  )
}
