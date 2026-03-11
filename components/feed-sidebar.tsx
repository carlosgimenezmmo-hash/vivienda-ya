"use client"

import { Heart, Share2, Bookmark, MessageCircle } from "lucide-react"
import { useProtectedAction } from "@/lib/protected-action-context"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface FeedSidebarProps {
  propertyId: string
  likes: number
}

export function FeedSidebar({ propertyId, likes }: FeedSidebarProps) {
  const { likedProperties, savedProperties, toggleLike, toggleSave } = useAuth()
  const { handleProtectedAction } = useProtectedAction()
  const router = useRouter()

  const isLiked = likedProperties.has(propertyId)
  const isSaved = savedProperties.has(propertyId)

  const actions = [
    {
      icon: Heart,
      label: `${isLiked ? likes + 1 : likes}`,
      active: isLiked,
      activeColor: "text-red-500",
      onClick: () => handleProtectedAction('Favoritos', () => toggleLike(propertyId)),
    },
    {
      icon: MessageCircle,
      label: "Chat",
      active: false,
      activeColor: "",
      onClick: () => handleProtectedAction('Contactar Dueño', () => {
        router.push('/inbox')
      }),
    },
    {
      icon: Bookmark,
      label: isSaved ? "Guardado" : "Guardar",
      active: isSaved,
      activeColor: "text-vy-gold",
      onClick: () => handleProtectedAction('Favoritos', () => toggleSave(propertyId)),
    },
    {
      icon: Share2,
      label: "Compartir",
      active: false,
      activeColor: "",
      onClick: () => {},
    },
  ]

  return (
    <div className="flex flex-col items-center gap-5">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center gap-1"
            aria-label={action.label}
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full glass transition-transform active:scale-90",
                action.active && action.activeColor
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  action.active && action.icon === Heart && "fill-current"
                )}
              />
            </span>
            <span className="text-[10px] font-medium text-white/80">{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}
