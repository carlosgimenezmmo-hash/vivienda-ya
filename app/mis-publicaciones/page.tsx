"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

export default function MisPublicacionesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [filtro, setFiltro] = useState("todas")
  const [confirmarId, setConfirmarId] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoggedIn || !user) return
    fetchProperties()
  }, [isLoggedIn, user, filtro])

  const fetchProperties = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id || user?.id
    if (!uid) { setLoading(false); return }
    let query = supabase.from("properties").select("*").eq("user_id", uid).order("created_at", { ascending: false })
    if (filtro !== "todas") query = query.eq("operation_type", filtro)
    const { data, error } = await query
    if (!error) setProperties(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    setConfirmarId(null)
    setDeleting(id)
    const { error } = await supabase.from("properties").delete().eq("id", id)
    if (!error) setProperties(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  if (!isLoggedIn || !user) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>Necesitas una cuenta</p>
          <button onClick={() => router.push("/registro")} style={{ background: "#2563EB", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 15, cursor: "pointer" }}>Registrarme</button>
        </div>
      </div>
    )
  }

  const chipStyle = (active: boolean) => ({
    padding: "8px 16px", borderRadius: 20,
    border: `1px solid ${active ? "#2563EB" : "rgba(255,255,255,0.2)"}`,
    background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)",
    color: active ? "#60A5FA" : "rgba(255,255,255,0.7)",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  })

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Mis Publicaciones</h1>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 20px 16px", flexWrap: "wrap" }}>
        {["todas", "venta", "alquiler", "permuta"].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={chipStyle(filtro === f) as any}>
            {f === "todas" ? "Todas" : f === "venta" ? "Ventas" : f === "alquiler" ? "Alquileres" : "Permutas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Cargando...</p>
        </div>
      ) : properties.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
          <span style={{ fontSize: 48, marginBottom: 16 }}>🏠</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>No tenes publicaciones</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Publica tu primera propiedad y aparecera en el feed</p>
          <button onClick={() => router.push("/publicar")} style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)", border: "none", borderRadius: 14, padding: "14px 28px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Publicar propiedad</button>
        </div>
      ) : (
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {properties.map((p) => (
            <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
              {p.video_url && (
                <video src={p.video_url} style={{ width: "100%", height: 180, objectFit: "cover" }} muted playsInline />
              )}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    background: p.status === "approved" ? "rgba(34,197,94,0.15)" : p.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                    color: p.status === "approved" ? "#22C55E" : p.status === "rejected" ? "#EF4444" : "#F59E0B",
                    border: `1px solid ${p.status === "approved" ? "rgba(34,197,94,0.3)" : p.status === "rejected" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                    borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700
                  }}>
                    {p.status === "approved" ? "Activa" : p.status === "rejected" ? "Rechazada" : "En revision"}
                  </span>
                  <span style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                    {p.operation_type?.toUpperCase() || "VENTA"}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{p.title || "Sin titulo"}</h3>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  {[p.neighborhood, p.city].filter(Boolean).join(", ") || p.location || "Sin ubicacion"}
                </p>
                <p style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800 }}>USD {Number(p.price)?.toLocaleString() || "Consultar"}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.operation_type === "venta" && p.status === "approved" && (
                    <button
                      onClick={() => router.push(`/intermediacion/solicitar?property_id=${p.id}`)}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)", color: "#22C55E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                      Solicitar intermediación
                    </button>
                  )}
                  <button onClick={() => setConfirmarId(p.id)} disabled={deleting === p.id}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#FCA5A5", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                    {deleting === p.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmarId !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setConfirmarId(null)}>
          <div style={{ background: "#1a1a1a", borderRadius: "24px 24px 0 0", padding: "28px 24px 48px", width: "100%", maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", margin: "0 auto 24px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: "0 0 8px", textAlign: "center" }}>Eliminar propiedad</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, textAlign: "center", margin: "0 0 28px" }}>Esta accion no se puede deshacer.</p>
            <button onClick={() => handleDelete(confirmarId)} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#EF4444", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12, fontFamily: "inherit" }}>
              {deleting === confirmarId ? "Eliminando..." : "Si, eliminar"}
            </button>
            <button onClick={() => setConfirmarId(null)} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
