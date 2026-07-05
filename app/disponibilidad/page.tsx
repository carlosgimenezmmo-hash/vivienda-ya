"use client"
import ModalLogin from "@/components/ModalLogin"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

export default function DisponibilidadPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [precioPorDia, setPrecioPorDia] = useState("")
  const [disponibilidades, setDisponibilidades] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingStart, setSelectingStart] = useState(true)
  const [hoverDate, setHoverDate] = useState<string | null>(null)

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

  useEffect(() => { if (!isLoggedIn) return; fetchProperties() }, [isLoggedIn])
  useEffect(() => { if (selectedProperty) { fetchDisponibilidades(selectedProperty.id); fetchReservas(selectedProperty.id) } }, [selectedProperty])

  const fetchProperties = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) return
    const { data } = await supabase.from("properties").select("*").eq("user_id", uid).eq("operation_type", "temporario")
    setProperties(data || [])
  }

  const fetchDisponibilidades = async (propertyId: number) => {
    const { data } = await supabase.from("disponibilidad").select("*").eq("property_id", propertyId).order("fecha_desde", { ascending: true })
    setDisponibilidades(data || [])
  }

  const fetchReservas = async (propertyId: number) => {
    const { data } = await supabase.from("reservas").select("*").eq("property_id", propertyId).in("estado", ["confirmada", "pendiente"])
    setReservas(data || [])
  }

  const getDayStatus = (dateStr: string): "disponible" | "reservado" | "libre" => {
    const date = new Date(dateStr + "T12:00:00")
    for (const r of reservas) {
      const desde = new Date(r.fecha_desde + "T00:00:00")
      const hasta = new Date(r.fecha_hasta + "T23:59:59")
      if (date >= desde && date <= hasta) return "reservado"
    }
    for (const d of disponibilidades) {
      const desde = new Date(d.fecha_desde + "T00:00:00")
      const hasta = new Date(d.fecha_hasta + "T23:59:59")
      if (date >= desde && date <= hasta) return "disponible"
    }
    return "libre"
  }

  const isInSelectionRange = (dateStr: string): boolean => {
    if (!fechaDesde) return false
    const end = hoverDate || fechaHasta
    if (!end) return false
    const d = new Date(dateStr + "T12:00:00")
    const start = new Date(fechaDesde + "T12:00:00")
    const endD = new Date(end + "T12:00:00")
    return d > start && d < endD
  }

  const handleDayClick = (dateStr: string) => {
    if (!fechaDesde || (!selectingStart && dateStr <= fechaDesde)) {
      setFechaDesde(dateStr)
      setFechaHasta("")
      setSelectingStart(false)
    } else {
      setFechaHasta(dateStr)
      setSelectingStart(true)
    }
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date().toISOString().split("T")[0]
    const days = []
    const adjustedFirst = (firstDay + 6) % 7 // lunes primero

    for (let i = 0; i < adjustedFirst; i++) {
      days.push(<div key={`e-${i}`} />)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const status = getDayStatus(dateStr)
      const isStart = dateStr === fechaDesde
      const isEnd = dateStr === fechaHasta
      const inRange = isInSelectionRange(dateStr)
      const isPast = dateStr < today

      let bg = "transparent"
      let color = isPast ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.85)"
      let border = "1px solid transparent"
      let fontWeight: any = 400

      if (status === "reservado") { bg = "rgba(239,68,68,0.25)"; color = "#EF4444"; border = "1px solid rgba(239,68,68,0.4)" }
      else if (status === "disponible") { bg = "rgba(34,197,94,0.2)"; color = "#22C55E"; border = "1px solid rgba(34,197,94,0.35)" }

      if (isStart || isEnd) { bg = "#2563EB"; color = "#fff"; border = "1px solid #2563EB"; fontWeight = 700 }
      else if (inRange) { bg = "rgba(37,99,235,0.25)"; border = "1px solid rgba(37,99,235,0.4)" }

      days.push(
        <div
          key={dateStr}
          onClick={() => !isPast && handleDayClick(dateStr)}
          onMouseEnter={() => !selectingStart && setHoverDate(dateStr)}
          onMouseLeave={() => setHoverDate(null)}
          style={{
            aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 10, fontSize: 13, cursor: isPast ? "default" : "pointer",
            background: bg, color, border, fontWeight,
            transition: "all 0.15s",
          }}
        >
          {d}
        </div>
      )
    }
    return days
  }

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

  const handleGuardar = async () => {
    setError(""); setSuccess("")
    if (!selectedProperty) return setError("Selecciona una propiedad")
    if (!fechaDesde || !fechaHasta) return setError("Selecciona el rango en el calendario")
    if (!precioPorDia) return setError("Ingresa el precio por dia")
    if (new Date(fechaDesde) >= new Date(fechaHasta)) return setError("La fecha de inicio debe ser anterior a la fecha de fin")
    setLoading(true)
    const { error: insertError } = await supabase.from("disponibilidad").insert({
      property_id: selectedProperty.id,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      precio_por_dia: parseFloat(precioPorDia),
    })
    setLoading(false)
    if (insertError) return setError(insertError.message)
    setSuccess("Disponibilidad guardada correctamente")
    setFechaDesde(""); setFechaHasta(""); setPrecioPorDia("")
    setSelectingStart(true)
    fetchDisponibilidades(selectedProperty.id)
  }

  const handleEliminar = async (id: number) => {
    await supabase.from("disponibilidad").delete().eq("id", id)
    fetchDisponibilidades(selectedProperty.id)
  }

  const formatDate = (str: string) => {
    const [y, m, d] = str.split("-")
    return `${d}/${m}/${y}`
  }
  if (!isLoggedIn || !user) return <ModalLogin />
  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Gestionar Disponibilidad</h1>
      </div>

      <div style={{ padding: "0 20px" }}>

        {properties.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>No tenes propiedades de alquiler temporario publicadas</p>
            <button onClick={() => router.push("/publicar")} style={{ ...btn, marginTop: 16, width: "auto", padding: "12px 24px" }}>Publicar propiedad</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Selecciona la propiedad</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {properties.map(p => (
                <button key={p.id} onClick={() => setSelectedProperty(p)} style={{
                  padding: "14px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                  border: `2px solid ${selectedProperty?.id === p.id ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
                  background: selectedProperty?.id === p.id ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
                  color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{p.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.neighborhood}, {p.city}</p>
                </button>
              ))}
            </div>

            {selectedProperty && (
              <>
                {/* Calendario */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px", marginBottom: 20 }}>

                  {/* Navegacion mes */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <button onClick={prevMonth} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 32, height: 32, color: "#fff", cursor: "pointer", fontSize: 16 }}>‹</button>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button onClick={nextMonth} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 32, height: 32, color: "#fff", cursor: "pointer", fontSize: 16 }}>›</button>
                  </div>

                  {/* Dias de la semana */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
                    {["Lu","Ma","Mi","Ju","Vi","Sa","Do"].map(d => (
                      <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", padding: "4px 0" }}>{d}</div>
                    ))}
                  </div>

                  {/* Grid dias */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                    {renderCalendar()}
                  </div>

                  {/* Leyenda */}
                  <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.35)" }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Disponible</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.4)" }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Reservado</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: "#2563EB" }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Seleccionado</span>
                    </div>
                  </div>

                  {/* Instruccion */}
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "12px 0 0", textAlign: "center" }}>
                    {!fechaDesde ? "Tocá el primer día del período" : !fechaHasta ? "Ahora tocá el último día" : `${formatDate(fechaDesde)} → ${formatDate(fechaHasta)}`}
                  </p>
                </div>

                {/* Fechas seleccionadas (solo lectura) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 6px", fontWeight: 600 }}>Desde</p>
                    <div style={{ ...inp, color: fechaDesde ? "#fff" : "rgba(255,255,255,0.25)" }}>{fechaDesde ? formatDate(fechaDesde) : "—"}</div>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 6px", fontWeight: 600 }}>Hasta</p>
                    <div style={{ ...inp, color: fechaHasta ? "#fff" : "rgba(255,255,255,0.25)" }}>{fechaHasta ? formatDate(fechaHasta) : "—"}</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Precio por dia (USD)</p>
                <input type="number" value={precioPorDia} onChange={e => setPrecioPorDia(e.target.value)} placeholder="Ej: 50" inputMode="numeric" style={{ ...inp, marginBottom: 16 }} />

                {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p></div>}
                {success && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><p style={{ color: "#22C55E", fontSize: 13, margin: 0 }}>{success}</p></div>}

                <button onClick={handleGuardar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1, marginBottom: 28 }}>
                  {loading ? "Guardando..." : "Guardar disponibilidad"}
                </button>

                {/* Lista periodos */}
                {disponibilidades.length > 0 && (
                  <>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", fontWeight: 600 }}>Periodos cargados</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {disponibilidades.map(d => (
                        <div key={d.id} style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{formatDate(d.fecha_desde)} → {formatDate(d.fecha_hasta)}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#22C55E", fontWeight: 600 }}>USD {d.precio_por_dia}/día</p>
                          </div>
                          <button onClick={() => handleEliminar(d.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "6px 12px", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Reservas activas */}
                {reservas.length > 0 && (
                  <>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "24px 0 12px", fontWeight: 600 }}>Reservas activas</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {reservas.map(r => (
                        <div key={r.id} style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 16px" }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{formatDate(r.fecha_desde)} → {formatDate(r.fecha_hasta)}</p>
                          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                            <p style={{ margin: 0, fontSize: 12, color: "#EF4444", fontWeight: 600 }}>{r.estado}</p>
                            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>USD {r.precio_total}</p>
                          </div>
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
