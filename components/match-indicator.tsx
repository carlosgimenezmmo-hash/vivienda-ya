import { cn } from "@/lib/utils"

interface MatchIndicatorProps {
  percentage: number
  className?: string
}

export function MatchIndicator({ percentage, className }: MatchIndicatorProps) {
  const getColor = () => {
    if (percentage >= 90) return "text-vy-green"
    if (percentage >= 70) return "text-vy-blue-light"
    return "text-white/70"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold glass",
        getColor(),
        className
      )}
    >
      {percentage}% MATCH
    </span>
  )
}
