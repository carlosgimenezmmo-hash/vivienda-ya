"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import Link from "next/link"
import "leaflet/dist/leaflet.css"

export interface MapProperty {
  id: string
  title: string
  price: number
  currency: "USD" | "ARS"
  operation_type: "venta" | "alquiler" | "permuta" | "temporario" | null
  hotel_name?: string | null
  property_subtype?: string | null
  lat: number
  lng: number
}

// Determina el color según la categoría de la propiedad
function getCategoryColor(p: MapProperty): string {
  if (p.operation_type === "temporario") {
    if (p.hotel_name) return "#22C55E" // verde - hotel
    if (p.property_subtype === "camping") return "#EAB308" // amarillo - camping
    return "#22C55E" // fallback temporario sin distinguir
  }
  if (p.operation_type === "venta") return "#EF4444" // rojo
  if (p.operation_type === "alquiler") return "#3B82F6" // azul
  if (p.operation_type === "permuta") return "#A855F7" // violeta
  return "#9CA3AF" // gris - sin categorizar
}

// Crea un ícono de pin coloreado sin depender de imágenes externas
function createColoredIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 22px;
      height: 22px;
      border-radius: 50% 50% 50% 0;
      background: ${color};
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22],
  })
}

interface PropertyMapProps {
  properties: MapProperty[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export default function PropertyMap({
  properties,
  center = [-38.3739, -60.2767], // Tres Arroyos por defecto
  zoom = 13,
  height = "500px",
}: PropertyMapProps) {
  return (
    <div style={{ height, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createColoredIcon(getCategoryColor(p))}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong>{p.title}</strong>
                <div>
                  {p.currency} {p.price?.toLocaleString("es-AR")}
                </div>
                <Link href={`/propiedad/${p.id}`}>Ver propiedad →</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}