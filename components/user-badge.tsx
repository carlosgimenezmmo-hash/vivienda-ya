import { cn } from "@/lib/utils"
import { Crown, Shield, Star, User, Award, Gem } from "lucide-react"
import type { UserLevel } from "@/lib/types"

interface UserBadgeProps {
  level: UserLevel
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const levelConfig: Record<UserLevel, { label: string; icon: typeof Star; colorClass: string }> = {
  visitante: { label: "Visitante", icon: User, colorClass: "bg-gray-500/80 text-white" },
  basico: { label: "Basico", icon: Shield, colorClass: "bg-vy-blue/80 text-white" },
  propietario: { label: "Propietario", icon: Star, colorClass: "bg-vy-green/80 text-white" },
  "propietario-plus": { label: "Propietario+", icon: Award, colorClass: "bg-emerald-500/80 text-white" },
  inmobiliaria: { label: "Inmobiliaria", icon: Gem, colorClass: "bg-vy-gold/80 text-black" },
  top: { label: "TOP", icon: Crown, colorClass: "bg-vy-gold text-black" },
}

export function UserBadge({ level, size = "sm", showLabel = false, className }: UserBadgeProps) {
  const config = levelConfig[level]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        config.colorClass,
        size === "sm" && "px-1.5 py-0.5 text-[9px]",
        size === "md" && "px-2 py-0.5 text-[10px]",
        size === "lg" && "px-3 py-1 text-xs",
        className
      )}
    >
      <Icon className={cn(
        size === "sm" && "h-2.5 w-2.5",
        size === "md" && "h-3 w-3",
        size === "lg" && "h-3.5 w-3.5"
      )} />
      {showLabel && config.label}
      {!showLabel && size !== "sm" && config.label}
    </span>
  )
}
