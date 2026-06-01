"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

export default function HotelHabitacionesPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [hotels, setHotels] = useState<any[]>([])
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [habitaciones, setHabitaciones] = useState<any[]>([])
  const [tipo, setTipo] = useState("doble")
  const [precio, setPrecio] = useState("")
  const [capacidad, setCapacidad] = useState("")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "10px 16px", borderRadius: 12,
    border: `2px solid ${active ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
    background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
    color: active ? "#60A5FA" : "rgba(255,255,255,0.7)",
    fontSize: 14, fontWeight: active ? 700 : 500, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  })

  useEffect(() => {
    if (isLoggedIn) fetchHotels()
  }, [isLoggedIn])

  useEffect(() => {
    if (selectedHotel) fetchHabitaciones(selectedHotel.id)
  }, [selectedHotel])

  const fetchHotels = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) return
    const { data } = await supabase.from("properties")
      .select("*")
      .eq("user_id", uid)
      .eq("operation_type", "hotel")
    setHotels(data || [])
  }

  const fetchHabitaciones = async (propertyId: number) => {
    const { data } = await supabase.from("hotel_habitaciones")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })
    setHabitaciones(data || [])
  }

  const handleGuardar = async () => {
    setError("")
    setSuccess("")
    if (!selectedHotel) return setError("Selecciona un hotel")
    if (!precio) return setError("Ingresa el precio por noche")
    if (!capacidad) return setError("Ingresa la capacidad")
    if (!fechaDesde || !fechaHasta) return setError("Completa las fechas")
    if (new Date(fechaDesde) >= new Date(fechaHasta)) return setError("Las fechas no son válidas")

    setLoading(true)
    const { error: insertError } = await supabase.from("hotel_habitaciones").insert({
      property_id: selectedHotel.id,
      tipo,
      precio_por_noche: parseFloat(precio),
      capacidad: parseInt(capacidad),
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
    })
    setLoading(false)

    if (insertError) return setError(insertError.message)
    setSuccess("Habitación guardada correctamente")
    setPrecio("")
    setCapacidad("")
    setFechaDesde("")
    setFechaHasta("")
    fetchHabitaciones(selectedHotel.id)
  }

  const handleEliminar = async (id: number) => {
    await supabase.from("hotel_habitaciones").delete().eq("id", id)
    fetchHabitaciones(selectedHotel.id)
  }

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <button onClick={() => router.push("/registro")} style={btn}>Registrarme</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Gestionar Habitaciones</h1>
      </div>

      <div style={{ padding: "0 20px" }}>
        {hotels.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>No tenés hoteles publicados</p>
            <button onClick={() => router.push("/publicar")} style={{ ...btn, marginTop: 16, width: "auto", padding: "12px 24px" }}>Publicar hotel</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Selecciona el hotel</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {hotels.map(h => (
                <button key={h.id} onClick={() => setSelectedHotel(h)} style={{
                  padding: "14px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                  border: `2px solid ${selectedHotel?.id === h.id ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
                  background: selectedHotel?.id === h.id ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
                  color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{h.hotel_name || h.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{h.neighborhood}, {h.city}</p>
                </button>
              ))}
            </div>

            {selectedHotel && (
              <>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", fontWeight: 600 }}>Agregar habitación</p>

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Tipo</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {[["simple", "🛏 Simple"], ["doble", "🛏🛏 Doble"], ["suite", "👑 Suite"], ["familiar", "👨‍👩‍👧 Familiar"]].map(([val, label]) => (
                    <button key={val} onClick={() => setTipo(val)} style={chip(tipo === val)}>{label}</button>
                  ))}
                </div>

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Precio por noche (USD)</p>
                <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Ej: 80" inputMode="numeric" style={{ ...inp, marginBottom: 12 }} />

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Capacidad (personas)</p>
                <input type="number" value={capacidad} onChange={e => setCapacidad(e.target.value)} placeholder="Ej: 2" inputMode="numeric" style={{ ...inp, marginBottom: 12 }} />

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Disponible desde</p>
                <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ ...inp, marginBottom: 12 }} />

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Disponible hasta</p>
                <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ ...inp, marginBottom: 16 }} />

                {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p></div>}
                {success && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><p style={{ color: "#22C55E", fontSize: 13, margin: 0 }}>{success}</p></div>}

                <button onClick={handleGuardar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1, marginBottom: 24 }}>
                  {loading ? "Guardando..." : "Guardar habitación"}
                </button>

                {habitaciones.length > 0 && (
                  <>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", fontWeight: 600 }}>Habitaciones cargadas</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {habitaciones.map(h => (
                        <div key={h.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: "capitalize" }}>{h.tipo}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{h.fecha_desde} → {h.fecha_hasta}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#22C55E", fontWeight: 600 }}>USD {h.precio_por_noche}/noche · {h.capacidad} pers.</p>
                          </div>
                          <button onClick={() => handleEliminar(h.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "6px 12px", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}