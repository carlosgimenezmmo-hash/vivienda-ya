"use client"

import { useState } from "react"
import { Play, Pause } from "lucide-react"
import type { Property } from "@/lib/types"
import { cn } from "@/lib/utils"
import { FeedOverlay } from "./feed-overlay"
import { FeedSidebar } from "./feed-sidebar"
import { MatchIndicator } from "./match-indicator"
import { HighlightedBadge } from "./highlighted-badge"

interface FeedItemProps {
  property: Property
}

export function FeedItem({ property }: FeedItemProps) {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className="relative h-dvh w-full snap-start overflow-hidden bg-black"
      onClick={() => setIsPaused((prev) => !prev)}
    >
      {/* Background image (simulating video) */}
      <img
        src={property.imageUrl}
        alt={property.title}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-transform duration-700",
          isPaused ? "scale-100" : "scale-105"
        )}
      />

      {/* Gradient overlay - bottom */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Gradient overlay - top */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Top bar: Logo + Match */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-3">
        <h1 className="text-lg font-bold tracking-tight text-white">
          Vivienda<span className="text-vy-green">Ya</span>
        </h1>
        <div className="flex items-center gap-2">
          {property.isHighlighted && <HighlightedBadge />}
          <MatchIndicator percentage={property.matchPercentage} />
        </div>
      </div>

      {/* Right sidebar actions */}
      <div className="absolute bottom-36 right-3 z-10">
        <FeedSidebar propertyId={property.id} likes={property.likes} />
      </div>

      {/* Bottom overlay: Property info */}
      <div className="absolute inset-x-0 bottom-20 z-10 px-4 pb-4">
        <FeedOverlay property={property} />
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="flex h-20 w-20 items-center justify-center rounded-full glass animate-in fade-in duration-200">
            <Pause className="h-10 w-10 text-white" />
          </div>
        </div>
      )}

      {/* Playing indicator (brief flash) */}
      {!isPaused && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-out fade-out duration-500">
          <div className="flex h-20 w-20 items-center justify-center rounded-full glass opacity-0">
            <Play className="h-10 w-10 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}
