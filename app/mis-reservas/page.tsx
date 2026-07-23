"use client"
import ModalLogin from "@/components/ModalLogin"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

export default function MisReservasPage() {
  const { isLoggedIn, user } = useAuth()
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

    const { data } = await supabase
      .from("reservas")
      .select("*, properties(title, neighborhood, city, video_url)")
      .eq("user_id", uid)
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

  const btn: React.CSSProperties = {
    width: "100%", padding: "16px", borderRadius: 14, border: "none",
    background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
    color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  }

 if (!isLoggedIn || !user) return <ModalLogin />
  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Mis Reservas</h1>
      </div>

      <div style={{ padding: "0 20px" }}>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 40 }}>Cargando...</p>
        ) : reservas.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 20 }}>No tenes reservas todavia</p>
            <button onClick={() => router.push("/feed")} style={{ ...btn, width: "auto", padding: "12px 24px" }}>
              Explorar propiedades
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reservas.map(r => (
              <div key={r.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{r.properties?.title || "Propiedad"}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                        {r.properties?.neighborhood}, {r.properties?.city}
                      </p>
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

                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px" }}>
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
                      <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Total pagado</span>
                      <span style={{ color: "#22C55E", fontSize: 14, fontWeight: 800 }}>USD {Number(r.precio_total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}