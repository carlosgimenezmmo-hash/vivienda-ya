"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

const ADMIN_EMAIL = "carlosgimenezmmo@gmail.com"

export default function AdminPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoggedIn || !user) return
    if (user.email !== ADMIN_EMAIL) {
      router.push("/")
      return
    }
    fetchProperties()
  }, [isLoggedIn, user, filter])

  const fetchProperties = async () => {
    setLoading(true)
    let query = supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
    if (filter !== "all") query = query.eq("status", filter)
    const { data, error } = await query
    if (!error) setProperties(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id)
    const { error } = await supabase.from("properties").update({ status }).eq("id", id)
    if (!error) {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    } else {
      alert("Error: " + error.message)
    }
    setUpdating(null)
  }

  if (!isLoggedIn || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <p>Acceso denegado</p>
      </div>
    )
  }

  const statusColor = (s: string) => {
    if (s === "approved") return { bg: "rgba(34,197,94,0.15)", color: "#22C55E", border: "rgba(34,197,94,0.3)" }
    if (s === "rejected") return { bg: "rgba(239,68,68,0.15)", color: "#EF4444", border: "rgba(239,68,68,0.3)" }
    return { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "rgba(245,158,11,0.3)" }
  }

  const statusLabel = (s: string) => s === "approved" ? "Aprobada" : s === "rejected" ? "Rechazada" : "Pendiente"

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 20px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Panel Admin</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>Moderacion de propiedades</p>
      </div>

      {/* FILTROS */}
      <div style={{ padding: "0 20px 20px", display: "flex", gap: 8, overflowX: "auto" }}>
        {(["pending", "all", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            background: filter === f ? "#2563EB" : "rgba(255,255,255,0.08)",
            color: filter === f ? "#fff" : "rgba(255,255,255,0.5)",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
          }}>
            {f === "pending" ? "Pendientes" : f === "all" ? "Todas" : f === "approved" ? "Aprobadas" : "Rechazadas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Cargando...</p>
        </div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>No hay propiedades {filter === "pending" ? "pendientes" : ""}</p>
        </div>
      ) : (
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {properties.map((p) => {
            const sc = statusColor(p.status)
            return (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>

                {/* VIDEO */}
                {p.video_url && (
                  <video src={p.video_url} controls style={{ width: "100%", height: 200, objectFit: "cover", background: "#000" }} />
                )}

                <div style={{ padding: "14px 16px" }}>
                  {/* STATUS */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                      {statusLabel(p.status)}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                      {new Date(p.created_at).toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{p.title || "Sin titulo"}</h3>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    {[p.neighborhood, p.city].filter(Boolean).join(", ") || p.location || "Sin ubicacion"}
                  </p>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    Publicado por: {p.owner_name || "Desconocido"}
                  </p>
                  <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>
                    USD {Number(p.price)?.toLocaleString() || "Consultar"}
                  </p>

                  {/* ACCIONES */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => updateStatus(p.id, "approved")}
                      disabled={updating === p.id || p.status === "approved"}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: p.status === "approved" ? "rgba(34,197,94,0.3)" : "#22C55E", color: "#fff", fontSize: 13, fontWeight: 700, cursor: p.status === "approved" ? "default" : "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
                    >
                      {updating === p.id ? "..." : "Aprobar"}
                    </button>
                    <button
                      onClick={() => updateStatus(p.id, "pending")}
                      disabled={updating === p.id || p.status === "pending"}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: p.status === "pending" ? "rgba(245,158,11,0.3)" : "#F59E0B", color: "#fff", fontSize: 13, fontWeight: 700, cursor: p.status === "pending" ? "default" : "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
                    >
                      {updating === p.id ? "..." : "Pendiente"}
                    </button>
                    <button
                      onClick={() => updateStatus(p.id, "rejected")}
                      disabled={updating === p.id || p.status === "rejected"}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: p.status === "rejected" ? "rgba(239,68,68,0.3)" : "#EF4444", color: "#fff", fontSize: 13, fontWeight: 700, cursor: p.status === "rejected" ? "default" : "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
                    >
                      {updating === p.id ? "..." : "Rechazar"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}