"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { supabase } from "@/lib/supabaseClient"
import type { MapProperty } from "@/components/map/PropertyMap"

// Leaflet necesita el navegador, así que el mapa se carga solo en el cliente
const PropertyMap = dynamic(() => import("@/components/map/PropertyMap"), {
  ssr: false,
  loading: () => <p style={{ padding: 20 }}>Cargando mapa...</p>,
})

export default function MapaPage() {
  const [properties, setProperties] = useState<MapProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, title, price, currency, operation_type, hotel_name, property_subtype, lat, lng"
        )
        .not("lat", "is", null)
        .not("lng", "is", null)
        .eq("mostrar_en_mapa", true)
        .eq("status", "approved")
        .eq("listing_status", "activa")
      if (error) {
        console.error("Error al traer propiedades para el mapa:", error)
      } else {
        setProperties(data as MapProperty[])
      }
      setLoading(false)
    }

    fetchProperties()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Mapa de propiedades
      </h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 14 }}>
        <LegendItem color="#EF4444" label="Venta" />
        <LegendItem color="#3B82F6" label="Alquiler" />
        <LegendItem color="#A855F7" label="Permuta" />
        <LegendItem color="#22C55E" label="Hotel" />
        <LegendItem color="#EAB308" label="Camping" />
      </div>

      {loading ? (
        <p>Cargando propiedades...</p>
      ) : (
        <PropertyMap properties={properties} height="600px" />
      )}
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: color,
        }}
      />
      {label}
    </div>
  )
}