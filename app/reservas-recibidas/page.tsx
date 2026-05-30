"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

export default function ReservasRecibidasPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoggedIn) fetchReservas()
  }, [isLoggedIn])

  const fetchReservas = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) return

    // Traer propiedades del usuario
    const { data: props } = await supabase
      .from("properties")
      .select("id")
      .eq("user_id", uid)

    if (!props || props.length === 0) {
      setLoading(false)
      return
    }

    const propertyIds = props.map(p => p.id)

    const { data } = await supabase
      .from("reservas")
      .select("*, properties(title, neighborhood, city)")
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false })

    setReservas(data || [])
    setLoading(false)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "confirmada": return "#22C55E"
      case "cancelada": return "#EF4444"
      default: return "#F59E0B"
    }
  }

  const handleConfirmar = async (id: number) => {
    await supabase.from("reservas").update({ estado: "confirmada" }).eq("id", id)
    await fetch("/api/notificar-huesped", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reserva_id: id, estado: "confirmada" }),
    })
    fetchReservas()
  }

  const handleCancelar = async (id: number) => {
    await supabase.from("reservas").update({ estado: "cancelada" }).eq("id", id)
    await fetch("/api/notificar-huesped", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reserva_id: id, estado: "cancelada" }),
    })
    fetchReservas()
  }
    await supabase.from("reservas").update({ estado: "confirmada" }).eq("id", id)
    fetchReservas()
  }

  const handleCancelar = async (id: number) => {
    await supabase.from("reservas").update({ estado: "cancelada" }).eq("id", id)
    fetchReservas()
  }

  const btn: React.CSSProperties = {
    width: "100%", padding: "16px", borderRadius: 14, border: "none",
    background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
    color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  }

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
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
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Reservas Recibidas</h1>
      </div>

      <div style={{ padding: "0 20px" }}>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 40 }}>Cargando...</p>
        ) : reservas.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>📭</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>No tenés reservas recibidas todavía</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reservas.map(r => (
              <div key={r.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{r.properties?.title || "Propiedad"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{r.properties?.neighborhood}, {r.properties?.city}</p>
                  </div>
                  <span style={{
                    background: `${getEstadoColor(r.estado)}20`,
                    border: `1px solid ${getEstadoColor(r.estado)}50`,
                    color: getEstadoColor(r.estado),
                    borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                    textTransform: "capitalize" as const
                  }}>
                    {r.estado}
                  </span>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Entrada</span>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{r.fecha_desde}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Salida</span>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{r.fecha_hasta}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Noches</span>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{r.noches}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Total</span>
                    <span style={{ color: "#22C55E", fontSize: 14, fontWeight: 800 }}>USD {Number(r.precio_total).toFixed(2)}</span>
                  </div>
                </div>

                {r.estado === "pendiente" && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => handleConfirmar(r.id)} style={{
                      flex: 1, padding: "12px", borderRadius: 12, border: "none",
                      background: "rgba(34,197,94,0.15)", color: "#22C55E",
                      fontSize: 14, fontWeight: 700, cursor: "pointer",
                      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                      border: "1px solid rgba(34,197,94,0.3)" as any,
                    }}>
                      ✅ Confirmar
                    </button>
                    <button onClick={() => handleCancelar(r.id)} style={{
                      flex: 1, padding: "12px", borderRadius: 12, border: "none",
                      background: "rgba(239,68,68,0.15)", color: "#EF4444",
                      fontSize: 14, fontWeight: 700, cursor: "pointer",
                      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                      border: "1px solid rgba(239,68,68,0.3)" as any,
                    }}>
                      ❌ Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}