"use client"

import { MapPin, Maximize2 } from "lucide-react"
import type { Property } from "@/lib/types"
import { ArryseBadge } from "./arryse-badge"
import { UserBadge } from "./user-badge"

interface FeedOverlayProps {
  property: Property
}

export function FeedOverlay({ property }: FeedOverlayProps) {
  const formatPrice = () => {
    if (property.currency === "USD") {
      return `USD ${property.price.toLocaleString("es-AR")}`
    }
    return `$ ${property.price.toLocaleString("es-AR")}`
  }

  const operationLabel: Record<string, string> = {
    venta: "VENTA",
    alquiler: "ALQUILER",
    permuta: "PERMUTA",
    temporario: "TEMPORARIO",
  }

  const operationColor: Record<string, string> = {
    venta: "bg-vy-blue",
    alquiler: "bg-vy-green",
    permuta: "bg-orange-500",
    temporario: "bg-pink-500",
  }

  return (
    <div className="flex flex-col gap-2.5 animate-slide-up">
      {/* Owner info */}
      <div className="flex items-center gap-2">
        <img
          src={property.owner.avatar}
          alt={property.owner.name}
          className="h-9 w-9 rounded-full border-2 border-white/30 object-cover"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white">{property.owner.name}</span>
            <UserBadge level={property.owner.level} size="sm" />
          </div>
        </div>
      </div>

      {/* Property info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold text-white ${operationColor[property.operation]}`}
          >
            {operationLabel[property.operation]}
          </span>
          {property.arryseVerified && (
            <ArryseBadge mode={property.arryseMode} size="sm" />
          )}
        </div>
        <h2 className="text-base font-bold leading-tight text-white text-pretty">
          {property.title}
        </h2>
        <div className="flex items-center gap-1 text-white/80">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-xs">
            {property.location.neighborhood}, {property.location.city}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">{formatPrice()}</span>
          {property.operation === "temporario" && (
            <span className="text-xs text-white/60">/noche</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70">
          {property.rooms > 0 && <span>{property.rooms} amb.</span>}
          {property.rooms > 0 && <span className="text-white/30">|</span>}
          <span>{property.area} m2</span>
          {property.bedrooms > 0 && (
            <>
              <span className="text-white/30">|</span>
              <span>{property.bedrooms} dorm.</span>
            </>
          )}
        </div>
      </div>

      {/* Expand hint */}
      <button className="flex items-center gap-1 text-[10px] text-white/50">
        <Maximize2 className="h-3 w-3" />
        Ver detalles
      </button>
    </div>
  )
}
