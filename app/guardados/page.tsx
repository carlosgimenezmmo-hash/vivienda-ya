"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

export default function GuardadosPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn || !user) return
    fetchSaved()
  }, [isLoggedIn, user])

  const fetchSaved = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id || user?.id
    if (!uid) { setLoading(false); return }

    const { data, error } = await supabase
      .from("saved_properties")
      .select("property_id, properties(*)")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProperties(data.map((d: any) => d.properties).filter(Boolean))
    }
    setLoading(false)
  }

  const handleUnsave = async (propertyId: number) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id || user?.id
    if (!uid) return
    const { error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("user_id", uid)
      .eq("property_id", propertyId)
    if (!error) {
      setProperties(prev => prev.filter(p => p.id !== propertyId))
    }
  }

  if (!isLoggedIn || !user) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>Necesitas una cuenta</p>
          <button onClick={() => router.push("/registro")} style={{ background: "#2563EB", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 15, cursor: "pointer" }}>
            Registrarme
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Guardados</h1>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Cargando...</p>
        </div>
      ) : properties.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
          <span style={{ fontSize: 48, marginBottom: 16 }}>🔖</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>No tenes guardados</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Guarda propiedades desde el feed tocando el icono de marcador</p>
          <button onClick={() => router.push("/")} style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)", border: "none", borderRadius: 14, padding: "14px 28px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Explorar propiedades
          </button>
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
                  <span style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                    {p.operation_type?.toUpperCase() || "VENTA"}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{p.title || "Sin titulo"}</h3>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  {[p.neighborhood, p.city].filter(Boolean).join(", ") || p.location || "Sin ubicacion"}
                </p>
                <p style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800 }}>
                  USD {Number(p.price)?.toLocaleString() || "Consultar"}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => router.push("/")}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "rgba(37,99,235,0.2)", color: "#60A5FA", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
                  >
                    Ver en feed
                  </button>
                  <button
                    onClick={() => handleUnsave(p.id)}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#FCA5A5", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}