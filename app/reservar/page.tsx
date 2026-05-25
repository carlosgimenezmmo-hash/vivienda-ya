"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

export default function ReservarPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get("id")

  const [property, setProperty] = useState<any>(null)
  const [disponibilidades, setDisponibilidades] = useState<any[]>([])
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [noches, setNoches] = useState(0)
  const [precioTotal, setPrecioTotal] = useState(0)
  const [comision, setComision] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<any>(null)

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
      fetchProperty()
      fetchDisponibilidades()
    }
  }, [propertyId])

  useEffect(() => {
    if (fechaDesde && fechaHasta && periodoSeleccionado) {
      const desde = new Date(fechaDesde)
      const hasta = new Date(fechaHasta)
      const diff = Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24))
      if (diff > 0) {
        const subtotal = diff * periodoSeleccionado.precio_por_dia
        const com = subtotal * COMISION
        setNoches(diff)
        setPrecioTotal(subtotal + com)
        setComision(com)
      }
    }
  }, [fechaDesde, fechaHasta, periodoSeleccionado])

  const fetchProperty = async () => {
    const { data } = await supabase.from("properties").select("*").eq("id", propertyId).single()
    setProperty(data)
  }

  const fetchDisponibilidades = async () => {
    const { data } = await supabase.from("disponibilidad")
      .select("*")
      .eq("property_id", propertyId)
      .gte("fecha_hasta", new Date().toISOString().split("T")[0])
      .order("fecha_desde", { ascending: true })
    setDisponibilidades(data || [])
  }

  const handleReservar = async () => {
    if (!isLoggedIn) return router.push("/registro")
    setError("")
    if (!fechaDesde || !fechaHasta) return setError("Selecciona las fechas")
    if (!periodoSeleccionado) return setError("Selecciona un periodo disponible")
    if (new Date(fechaDesde) >= new Date(fechaHasta)) return setError("Las fechas no son validas")

    setLoading(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id

    const { error: insertError } = await supabase.from("reservas").insert({
      property_id: parseInt(propertyId!),
      user_id: uid || null,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      noches,
      precio_total: precioTotal,
      comision,
      estado: "pendiente",
    })

    setLoading(false)
    if (insertError) return setError(insertError.message)
    router.push("/reservas-confirmadas")
  }

  if (!property) {
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
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Reservar</h1>
      </div>

      <div style={{ padding: "0 20px" }}>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 24 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>{property.title}</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            {property.neighborhood}, {property.city}
          </p>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", fontWeight: 600 }}>Periodos disponibles</p>

        {disponibilidades.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No hay fechas disponibles por el momento</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {disponibilidades.map(d => (
              <button key={d.id} onClick={() => { setPeriodoSeleccionado(d); setFechaDesde(d.fecha_desde); setFechaHasta(d.fecha_hasta) }} style={{
                padding: "14px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: `2px solid ${periodoSeleccionado?.id === d.id ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
                background: periodoSeleccionado?.id === d.id ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
                color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{d.fecha_desde} → {d.fecha_hasta}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#22C55E", fontWeight: 600 }}>USD {d.precio_por_dia}/noche</p>
              </button>
            ))}
          </div>
        )}

        {periodoSeleccionado && (
          <>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Fecha de entrada</p>
            <input type="date" value={fechaDesde} min={periodoSeleccionado.fecha_desde} max={periodoSeleccionado.fecha_hasta} onChange={e => setFechaDesde(e.target.value)} style={{ ...inp, marginBottom: 12 }} />

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Fecha de salida</p>
            <input type="date" value={fechaHasta} min={fechaDesde || periodoSeleccionado.fecha_desde} max={periodoSeleccionado.fecha_hasta} onChange={e => setFechaHasta(e.target.value)} style={{ ...inp, marginBottom: 20 }} />

            {noches > 0 && (
              <div style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{noches} noches x USD {periodoSeleccionado.precio_por_dia}</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>USD {(noches * periodoSeleccionado.precio_por_dia).toFixed(2)}</span>
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
          </>
        )}

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {periodoSeleccionado && (
          <button onClick={handleReservar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Procesando..." : isLoggedIn ? "Confirmar reserva" : "Registrate para reservar"}
          </button>
        )}
      </div>
    </div>
  )
}