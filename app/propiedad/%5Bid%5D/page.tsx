"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

export default function PropiedadPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
const params = useParams()
  const id = params?.id
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [nearbyAmenities, setNearbyAmenities] = useState<{ label: string; count: number; names: string[] }[]>([])
  const [amenitiesLoading, setAmenitiesLoading] = useState(false)
  const [amenitiesError, setAmenitiesError] = useState("")

  useEffect(() => {
    if (id) fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    const { data } = await supabase.from("properties").select("*").eq("id", id).single()
    setProperty(data)
    setLoading(false)
    if (data) {
      supabase.from("properties").update({ views: (data.views || 0) + 1 }).eq("id", id)
    }
    if (data?.lat && data?.lng) {
      void fetchNearbyAmenities(data.lat, data.lng)
    }
  }

  const fetchNearbyAmenities = async (lat: number, lng: number) => {
    setAmenitiesLoading(true)
    setAmenitiesError("")
    setNearbyAmenities([])
    try {
      const query = `
[out:json][timeout:25];
(
  node(around:1200,${lat},${lng})[amenity];
  way(around:1200,${lat},${lng})[amenity];
  relation(around:1200,${lat},${lng})[amenity];
  node(around:1200,${lat},${lng})[shop];
  way(around:1200,${lat},${lng})[shop];
  relation(around:1200,${lat},${lng})[shop];
  node(around:1200,${lat},${lng})[tourism];
  way(around:1200,${lat},${lng})[tourism];
  relation(around:1200,${lat},${lng})[tourism];
  node(around:1200,${lat},${lng})[leisure];
  way(around:1200,${lat},${lng})[leisure];
  relation(around:1200,${lat},${lng})[leisure];
);
out center;
      `
      const res = await fetch(`https://overpass-api.de/api/interpreter`, {
        method: "POST",
        body: query,
      })
      const data = await res.json()
      const categoryMap: Record<string, string> = {
        school: "Colegio / Escuela",
        hospital: "Hospital",
        clinic: "Clínica",
        university: "Universidad",
        college: "Facultad",
        kindergarten: "Jardín de infantes",
        pharmacy: "Farmacia",
        townhall: "Centro cívico",
        post_office: "Correo",
        library: "Biblioteca",
        police: "Comisaría",
        fire_station: "Bomberos",
        bank: "Banco",
        bus_station: "Estación de buses",
        taxi: "Parada de taxi",
        place_of_worship: "Templo",
        supermarket: "Supermercado",
        mall: "Centro comercial",
        department_store: "Local comercial",
        bakery: "Panadería",
        convenience: "Maxikiosco",
        clothes: "Indumentaria",
        electronics: "Electrónica",
        books: "Librería",
        furniture: "Muebles",
        toys: "Juguetería",
        gift: "Regalería",
        sports: "Deportes",
        optical: "Óptica",
        florist: "Floristería",
        beauty: "Belleza",
        jewelry: "Joyería",
        museum: "Museo",
        theatre: "Teatro",
        attraction: "Atracción",
        viewpoint: "Mirador",
        hotel: "Hotel",
        information: "Información turística",
        gallery: "Galería",
        zoo: "Zoológico",
        theme_park: "Parque temático",
        park: "Parque",
        playground: "Plaza",
        sports_centre: "Centro deportivo",
        stadium: "Estadio",
        swimming_pool: "Pileta",
        water_park: "Parque acuático",
        theater: "Teatro",
        cinema: "Cine",
        arts_centre: "Centro cultural",
        marketplace: "Mercado",
        daycare: "Guardería",
        medical_center: "Centro de salud",
      }
      const formatLabel = (tag: string) => {
        if (categoryMap[tag]) return categoryMap[tag]
        return tag.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
      }
      const collector: Record<string, { label: string; names: Set<string> }> = {}
      ;(data.elements || []).forEach((element: any) => {
        const tags = element.tags || {}
        const key = tags.amenity || tags.shop || tags.tourism || tags.leisure
        if (!key) return
        const label = formatLabel(key)
        const name = tags.name || label
        if (!collector[label]) collector[label] = { label, names: new Set() }
        collector[label].names.add(name)
      })
      const orderedLabels = [
        "Colegio / Escuela",
        "Jardín de infantes",
        "Hospital",
        "Clínica",
        "Centro de salud",
        "Farmacia",
        "Supermercado",
        "Centro comercial",
        "Mercado",
        "Comisaría",
        "Bomberos",
        "Banco",
        "Biblioteca",
        "Teatro",
        "Museo",
        "Cine",
        "Hotel",
        "Galería",
        "Parque",
        "Plaza",
        "Centro deportivo",
        "Pileta",
        "Óptica",
      ]
      const sorted = Object.values(collector).sort((a, b) => {
        const aIndex = orderedLabels.indexOf(a.label)
        const bIndex = orderedLabels.indexOf(b.label)
        if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
        return b.names.size - a.names.size
      })
      setNearbyAmenities(sorted.map(item => ({ label: item.label, count: item.names.size, names: Array.from(item.names).slice(0, 10) })))
    } catch (err) {
      setAmenitiesError("No se pudo cargar servicios cercanos")
    } finally {
      setAmenitiesLoading(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <p>Cargando...</p>
    </div>
  )

  if (!property) return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <p>Propiedad no encontrada</p>
    </div>
  )

 const handleWhatsApp = () => {
    if (!isLoggedIn) { router.push(`/registro?returnTo=/propiedad/${id}`); return }
    const clean = property.whatsapp_number?.replace(/\D/g, "")
    const msg = `Hola! Vi tu propiedad "${property.title}" en ViviendaYa y me interesa. Podes darme mas info?`
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank")
    supabase.from("properties").update({ contacts: (property.contacts || 0) + 1 }).eq("id", property.id)
  }
  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 120 }}>

      {/* VIDEO */}
      {property.video_url && (
        <div style={{ position: "relative", width: "100%", height: 320, background: "#000" }}>
          <video src={property.video_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay muted loop playsInline />
          <button onClick={() => router.back()} style={{ position: "absolute", top: 52, left: 16, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
        </div>
      )}

      <div style={{ padding: "20px 20px 0" }}>

        {/* BADGES */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
            {property.operation_type?.toUpperCase()}
          </span>
          {property.verified && (
            <span style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
              ✓ GPS Verificado
            </span>
          )}
          {property.highlighted && (
            <span style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
              ⭐ Destacada
            </span>
          )}
          {property.stars && (
            <span style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
              {"⭐".repeat(property.stars)}
            </span>
          )}
        </div>

        {/* TITULO Y PRECIO */}
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{property.hotel_name || property.title}</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 12px" }}>
          📍 {[property.neighborhood, property.city, property.province].filter(Boolean).join(", ")}
        </p>
        {property.price && (
          <p style={{ fontSize: 28, fontWeight: 900, margin: "0 0 20px", color: "#fff" }}>
            {property.operation_type === "hotel" ? "USD" : "ARS"} {Number(property.price).toLocaleString()}
          </p>
        )}

        {/* CARACTERISTICAS */}
        {(property.rooms || property.surface || property.bedrooms || property.room_type || property.max_guests) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Ambientes", valor: property.rooms, icono: "🏠" },
              { label: "Dormitorios", valor: property.bedrooms, icono: "🛏" },
              { label: "Baños", valor: property.bathrooms, icono: "🚿" },
              { label: "Superficie", valor: property.surface ? `${property.surface} m²` : null, icono: "📐" },
              { label: "Precio x m²", valor: property.precio_m2 ? `$${Number(property.precio_m2).toLocaleString()}` : null, icono: "💲" },
              { label: "Habitacion", valor: property.room_type, icono: "🛎" },
              { label: "Huespedes", valor: property.max_guests ? `${property.max_guests} pers.` : null, icono: "👥" },
            ].filter(c => c.valor).map(c => (
              <div key={c.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                <p style={{ margin: "0 0 4px", fontSize: 20 }}>{c.icono}</p>
                <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 800 }}>{c.valor}</p>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* DESCRIPCION */}
        {property.description && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{property.description}</p>
          </div>
        )}

        {/* SERVICIOS HOTEL */}
        {property.hotel_services && property.hotel_services.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", fontWeight: 600 }}>SERVICIOS</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {property.hotel_services.map((s: string) => (
                <span key={s} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "6px 12px", fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AMENITIES CERCANOS */}
        {(nearbyAmenities.length > 0 || amenitiesLoading || amenitiesError) && (
          <div style={{ marginBottom: 20, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: 16 }}>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Servicios cercanos</p>
            {amenitiesLoading ? (
              <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Buscando colegios, hospitales y centros...</p>
            ) : amenitiesError ? (
              <p style={{ margin: 0, color: "#F59E0B", fontSize: 13 }}>{amenitiesError}</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                {nearbyAmenities.map(item => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{item.count} lugar{item.count > 1 ? "es" : ""}</p>
                    <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{item.names.join(", ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAPA */}
        {property.lat && property.lng && (
          <div style={{ marginBottom: 20, borderRadius: 14, overflow: "hidden" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Ubicacion en el mapa</p>
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.lng - 0.005},${property.lat - 0.005},${property.lng + 0.005},${property.lat + 0.005}&layer=mapnik&marker=${property.lat},${property.lng}`}
              style={{ width: "100%", height: 200, border: "none", borderRadius: 14 }}
            />
          </div>
        )}

      </div>

      {/* BOTONES FIJOS */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px 32px", background: "rgba(10,10,10,0.97)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 10, zIndex: 20 }}>
        {(property.operation_type === "hotel") && (
          <button onClick={() => isLoggedIn ? router.push(`/hotel-reservar?id=${property.id}`) : router.push(`/registro?returnTo=/propiedad/${id}`)} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#F97316", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
            🏨 Ver habitaciones y reservar
          </button>
        )}
        {(property.operation_type === "temporario" || property.operation_type === "camping") && (
          <button onClick={() => isLoggedIn ? router.push(`/reservar?id=${property.id}`) : router.push(`/registro?returnTo=/propiedad/${id}`)} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#F97316", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
            {property.operation_type === "camping" ? "🏕️ Ver disponibilidad y reservar" : "📅 Ver disponibilidad y reservar"}
          </button>
        )}
        {property.whatsapp_number && (
          <button onClick={handleWhatsApp} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#25D366", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
            📞 Contactar por WhatsApp
          </button>
        )}
      </div>
      </div>
        )
}