"use client"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

function HotelReservarContent() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get("id")

  const [hotel, setHotel] = useState<any>(null)
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<any>(null)
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [noches, setNoches] = useState(0)
  const [precioTotal, setPrecioTotal] = useState(0)
  const [comision, setComision] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const COMISION = 0.08

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  }

  const btn: React.CSSProperties = {
    width: "100%", padding: "16px", borderRadius: 14, border: "none",
    background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
    color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  }

  useEffect(() => {
    if (propertyId) {
      fetchHotel()
      fetchHabitaciones()
    }
  }, [propertyId])

  useEffect(() => {
    if (fechaDesde && fechaHasta && habitacionSeleccionada) {
      const desde = new Date(fechaDesde)
      const hasta = new Date(fechaHasta)
      const diff = Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24))
      if (diff > 0) {
        const subtotal = diff * habitacionSeleccionada.precio_por_noche
        const com = subtotal * COMISION
        setNoches(diff)
        setPrecioTotal(subtotal + com)
        setComision(com)
      }
    }
  }, [fechaDesde, fechaHasta, habitacionSeleccionada])

  const fetchHotel = async () => {
    const { data } = await supabase.from("properties").select("*").eq("id", propertyId).single()
    setHotel(data)
  }

  const fetchHabitaciones = async () => {
    const { data } = await supabase.from("hotel_habitaciones")
      .select("*")
      .eq("property_id", propertyId)
      .gte("fecha_hasta", new Date().toISOString().split("T")[0])
      .order("precio_por_noche", { ascending: true })
    setHabitaciones(data || [])
  }

  const handleReservar = async () => {
    if (!isLoggedIn) return router.push("/registro")
    setError("")
    if (!fechaDesde || !fechaHasta) return setError("Selecciona las fechas")
    if (!habitacionSeleccionada) return setError("Selecciona una habitación")
    if (new Date(fechaDesde) >= new Date(fechaHasta)) return setError("Las fechas no son válidas")

    setLoading(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id

    const res = await fetch("/api/crear-reserva", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: parseInt(propertyId!),
        user_id: uid || null,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        noches,
        precio_total: precioTotal,
        comision,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) return setError(data.error)
    window.location.href = data.init_point
  }

  const tipoIcono = (tipo: string) => {
    switch (tipo) {
      case "simple": return "🛏"
      case "doble": return "🛏🛏"
      case "suite": return "👑"
      case "familiar": return "👨‍👩‍👧"
      default: return "🛏"
    }
  }

  if (!hotel) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Reservar habitación</h1>
      </div>

      <div style={{ padding: "0 20px" }}>

        {/* Info hotel */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 24 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>{hotel.hotel_name || hotel.title}</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            {hotel.neighborhood}, {hotel.city}
          </p>
          {hotel.stars && (
            <p style={{ margin: "6px 0 0", fontSize: 16 }}>
              {"⭐".repeat(hotel.stars)}
            </p>
          )}
        </div>

        {/* Fechas */}
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Fecha de entrada</p>
        <input type="date" value={fechaDesde} min={new Date().toISOString().split("T")[0]} onChange={e => { setFechaDesde(e.target.value); setHabitacionSeleccionada(null) }} style={{ ...inp, marginBottom: 12 }} />

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Fecha de salida</p>
        <input type="date" value={fechaHasta} min={fechaDesde || new Date().toISOString().split("T")[0]} onChange={e => { setFechaHasta(e.target.value); setHabitacionSeleccionada(null) }} style={{ ...inp, marginBottom: 24 }} />

        {/* Habitaciones disponibles */}
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", fontWeight: 600 }}>Habitaciones disponibles</p>

        {habitaciones.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No hay habitaciones disponibles</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {habitaciones.filter(h => {
              if (!fechaDesde || !fechaHasta) return true
              return new Date(h.fecha_desde) <= new Date(fechaDesde) && new Date(h.fecha_hasta) >= new Date(fechaHasta)
            }).map(h => (
              <button key={h.id} onClick={() => setHabitacionSeleccionada(h)} style={{
                padding: "16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: `2px solid ${habitacionSeleccionada?.id === h.id ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
                background: habitacionSeleccionada?.id === h.id ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
                color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{tipoIcono(h.tipo)} {h.tipo.charAt(0).toUpperCase() + h.tipo.slice(1)}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>👥 Hasta {h.capacidad} personas</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, color: "#22C55E", fontWeight: 800, fontSize: 16 }}>USD {h.precio_por_noche}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>por noche</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Resumen precio */}
        {noches > 0 && habitacionSeleccionada && (
          <div style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{noches} noches x USD {habitacionSeleccionada.precio_por_noche}</span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>USD {(noches * habitacionSeleccionada.precio_por_noche).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Servicio ViviendaYa (8%)</span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>USD {comision.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Total</span>
              <span style={{ color: "#22C55E", fontSize: 15, fontWeight: 800 }}>USD {precioTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {habitacionSeleccionada && (
          <button onClick={handleReservar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Procesando..." : isLoggedIn ? "Confirmar reserva" : "Registrate para reservar"}
          </button>
        )}
      </div>
    </div>
  )
}

export default function HotelReservarPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Cargando...</p></div>}>
      <HotelReservarContent />
    </Suspense>
  )
}