"use client"
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

  useEffect(() => {
    if (!isLoggedIn) return
    fetchProperties()
  }, [isLoggedIn])

  useEffect(() => {
    if (selectedProperty) fetchDisponibilidades(selectedProperty.id)
  }, [selectedProperty])

  const fetchProperties = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) return
    const { data } = await supabase.from("properties")
      .select("*")
      .eq("user_id", uid)
      .eq("operation_type", "temporario")
    setProperties(data || [])
  }

  const fetchDisponibilidades = async (propertyId: number) => {
    const { data } = await supabase.from("disponibilidad")
      .select("*")
      .eq("property_id", propertyId)
      .order("fecha_desde", { ascending: true })
    setDisponibilidades(data || [])
  }

  const handleGuardar = async () => {
    setError("")
    setSuccess("")
    if (!selectedProperty) return setError("Selecciona una propiedad")
    if (!fechaDesde || !fechaHasta) return setError("Completa las fechas")
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
    setFechaDesde("")
    setFechaHasta("")
    setPrecioPorDia("")
    fetchDisponibilidades(selectedProperty.id)
  }

  const handleEliminar = async (id: number) => {
    await supabase.from("disponibilidad").delete().eq("id", id)
    fetchDisponibilidades(selectedProperty.id)
  }

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>Necesitas una cuenta</p>
          <button onClick={() => router.push("/registro")} style={btn}>Registrarme</button>
        </div>
      </div>
    )
  }

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
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", fontWeight: 600 }}>Agregar periodo disponible</p>

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Desde</p>
                <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ ...inp, marginBottom: 12 }} />

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Hasta</p>
                <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ ...inp, marginBottom: 12 }} />

                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Precio por dia (USD)</p>
                <input type="number" value={precioPorDia} onChange={e => setPrecioPorDia(e.target.value)} placeholder="Ej: 50" inputMode="numeric" style={{ ...inp, marginBottom: 16 }} />

                {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p></div>}
                {success && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><p style={{ color: "#22C55E", fontSize: 13, margin: 0 }}>{success}</p></div>}

                <button onClick={handleGuardar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1, marginBottom: 24 }}>
                  {loading ? "Guardando..." : "Guardar disponibilidad"}
                </button>

                {disponibilidades.length > 0 && (
                  <>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", fontWeight: 600 }}>Periodos cargados</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {disponibilidades.map(d => (
                        <div key={d.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{d.fecha_desde} → {d.fecha_hasta}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#22C55E", fontWeight: 600 }}>USD {d.precio_por_dia}/dia</p>
                          </div>
                          <button onClick={() => handleEliminar(d.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "6px 12px", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
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