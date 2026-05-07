"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

const ADMIN_ID = "369cd5ef-e2d3-4e5d-9a1b-aaa432f407e0"

const PLAN_PRECIO: Record<string, number> = {
  junior: 25000,
  agente: 50000,
  especializado: 80000,
  senior: 150000,
}

const PLAN_COLOR: Record<string, string> = {
  gratis: "#888",
  junior: "#94A3B8",
  agente: "#F59E0B",
  especializado: "#2563EB",
  senior: "#A855F7",
}

export default function AdminPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<"resumen" | "usuarios" | "propiedades" | "suscripciones" | "moderacion">("resumen")
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [pagos, setPagos] = useState<any[]>([])
  const [updating, setUpdating] = useState<number | null>(null)
  const [filterMod, setFilterMod] = useState<"pending" | "approved" | "rejected" | "all">("pending")

  useEffect(() => {
    if (!isLoggedIn || !user) return
    if (user.id !== ADMIN_ID) { router.push("/"); return }
    fetchAll()
  }, [isLoggedIn, user])

  const fetchAll = async () => {
    setLoading(true)
    const [u, p, s, pg] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("pagos_servicios").select("*").order("fecha", { ascending: false }),
    ])
    setUsers(u.data || [])
    setProperties(p.data || [])
    setSubscriptions(s.data || [])
    setPagos(pg.data || [])
    setLoading(false)
  }

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id)
    await supabase.from("properties").update({ status }).eq("id", id)
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    setUpdating(null)
  }

  if (!isLoggedIn || !user || user.id !== ADMIN_ID) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <p>Acceso denegado</p>
      </div>
    )
  }

  const subsActivas = subscriptions.filter(s => s.estado === "activo" && new Date(s.fecha_vencimiento) > new Date())
  const mrr = subsActivas.reduce((acc, s) => acc + (PLAN_PRECIO[s.plan] || 0), 0)
  const totalFacturado = pagos.reduce((acc, p) => acc + (p.precio || 0), 0) + mrr
  const propActivas = properties.filter(p => p.status === "approved" || !p.status).length
  const propPendientes = properties.filter(p => p.status === "pending").length
  const totalVistas = properties.reduce((acc, p) => acc + (p.views || 0), 0)
  const totalLikes = properties.reduce((acc, p) => acc + (p.likes || 0), 0)
  const totalContactos = properties.reduce((acc, p) => acc + (p.contacts || 0), 0)

  const porPlan = subsActivas.reduce((acc: Record<string, number>, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1
    return acc
  }, {})

  const porCiudad = properties.reduce((acc: Record<string, number>, p) => {
    const c = p.city || "Sin ciudad"
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})

  const porTipo = properties.reduce((acc: Record<string, number>, p) => {
    const t = p.property_type || "Sin tipo"
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  const porOperacion = properties.reduce((acc: Record<string, number>, p) => {
    const o = p.operation_type || "Sin operacion"
    acc[o] = (acc[o] || 0) + 1
    return acc
  }, {})

  const vencenProximo = subscriptions.filter(s => {
    if (s.estado !== "activo") return false
    const dias = (new Date(s.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return dias <= 7 && dias > 0
  })

  const usuariosPorCiudad = users.reduce((acc: Record<string, number>, u) => {
    const c = u.city || "Sin ciudad"
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})

  const propMasVistas = [...properties].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
  const propsFiltradas = tab === "moderacion"
    ? filterMod === "all" ? properties : properties.filter(p => p.status === filterMod)
    : []

  const card = (extra?: any): React.CSSProperties => ({
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    ...extra,
  })

  const label: React.CSSProperties = {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    margin: "0 0 6px",
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: active ? "rgba(255,255,255,0.12)" : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    whiteSpace: "nowrap" as const,
  })

  const grid = (cols: string): React.CSSProperties => ({
    display: "grid",
    gridTemplateColumns: cols,
    gap: 12,
    marginBottom: 20,
  })

  if (loading) return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Vivienda<span style={{ color: "#22C55E" }}>Ya</span></p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Cargando panel admin...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      <div style={{ padding: "52px 24px 20px", maxWidth: 1200, margin: "0 auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Panel Admin</h1>
              <span style={{ background: "#EF4444", borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 800, color: "#fff" }}>PRIVADO</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
              ViviendaYa — {new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button onClick={fetchAll} style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
            Actualizar
          </button>
        </div>

        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4, overflowX: "auto" }}>
          {([
            { id: "resumen", label: "Resumen" },
            { id: "usuarios", label: "Usuarios" },
            { id: "propiedades", label: "Propiedades" },
            { id: "suscripciones", label: "Suscripciones" },
            { id: "moderacion", label: "Moderacion" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>

        {tab === "resumen" && (
          <div>
            <div style={grid("repeat(auto-fit, minmax(180px, 1fr))")}>
              {[
                { label: "Usuarios totales", valor: users.length, color: "#2563EB" },
                { label: "Propiedades activas", valor: propActivas, color: "#22C55E" },
                { label: "Suscripciones activas", valor: subsActivas.length, color: "#A855F7" },
                { label: "MRR estimado", valor: `$${mrr.toLocaleString("es-AR")}`, color: "#F59E0B" },
                { label: "Vistas totales", valor: totalVistas, color: "#60A5FA" },
                { label: "Contactos WhatsApp", valor: totalContactos, color: "#25D366" },
              ].map(stat => (
                <div key={stat.label} style={card({ borderLeft: `3px solid ${stat.color}` })}>
                  <p style={label}>{stat.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, margin: 0, color: stat.color }}>{stat.valor}</p>
                </div>
              ))}
            </div>

            {(propPendientes > 0 || vencenProximo.length > 0) && (
              <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {propPendientes > 0 && (
                  <div onClick={() => setTab("moderacion")} style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#F59E0B", fontWeight: 600 }}>
                      {propPendientes} propiedad{propPendientes > 1 ? "es" : ""} esperando moderacion
                    </p>
                    <span style={{ marginLeft: "auto", color: "#F59E0B", fontSize: 18 }}>→</span>
                  </div>
                )}
                {vencenProximo.length > 0 && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#EF4444", fontWeight: 600 }}>
                      {vencenProximo.length} suscripcion{vencenProximo.length > 1 ? "es" : ""} vence en los proximos 7 dias
                    </p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <div style={card()}>
                <p style={{ ...label, marginBottom: 16 }}>Distribucion por plan</p>
                {Object.keys(PLAN_PRECIO).map(plan => {
                  const cant = porPlan[plan] || 0
                  const max = Math.max(...Object.values(porPlan), 1)
                  return (
                    <div key={plan} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: PLAN_COLOR[plan], fontWeight: 700, textTransform: "capitalize" }}>{plan}</span>
                        <span style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{cant}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: PLAN_COLOR[plan], width: `${(cant / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={card()}>
                <p style={{ ...label, marginBottom: 16 }}>Propiedades por ciudad</p>
                {Object.entries(porCiudad).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([ciudad, cant]) => {
                  const max = Math.max(...Object.values(porCiudad))
                  return (
                    <div key={ciudad} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{ciudad}</span>
                        <span style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{cant}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #2563EB, #60A5FA)", width: `${(cant / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={card()}>
                <p style={{ ...label, marginBottom: 16 }}>Por tipo de propiedad</p>
                {Object.entries(porTipo).sort((a, b) => b[1] - a[1]).map(([tipo, cant]) => (
                  <div key={tipo} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", textTransform: "capitalize" }}>{tipo}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{cant}</span>
                  </div>
                ))}
              </div>

              <div style={card()}>
                <p style={{ ...label, marginBottom: 16 }}>Venta vs Alquiler</p>
                {Object.entries(porOperacion).sort((a, b) => b[1] - a[1]).map(([op, cant]) => {
                  const total = properties.length || 1
                  const pct = Math.round((cant / total) * 100)
                  return (
                    <div key={op} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", textTransform: "capitalize" }}>{op}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{cant} ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ height: "100%", borderRadius: 4, background: op === "venta" ? "#22C55E" : "#F59E0B", width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ ...card(), gridColumn: "1 / -1" }}>
                <p style={{ ...label, marginBottom: 16 }}>Top 5 propiedades mas vistas</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {propMasVistas.map((p, i) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: i === 0 ? "#F59E0B" : "rgba(255,255,255,0.3)", width: 24 }}>#{i + 1}</span>
                      {p.video_url && <video src={p.video_url} style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} muted />}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{p.title || "Sin titulo"}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.city} · {p.owner_name}</p>
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#2563EB" }}>{p.views || 0}</p>
                          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>vistas</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#EF4444" }}>{p.likes || 0}</p>
                          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>likes</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#25D366" }}>{p.contacts || 0}</p>
                          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>contactos</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "usuarios" && (
          <div>
            <div style={grid("repeat(auto-fit, minmax(160px, 1fr))")}>
              {[
                { label: "Total usuarios", valor: users.length, color: "#2563EB" },
                { label: "Verificados DNI", valor: users.filter(u => u.dni_verificado).length, color: "#22C55E" },
                { label: "Con suscripcion", valor: subsActivas.length, color: "#A855F7" },
                { label: "Con videos extra", valor: users.filter(u => (u.videos_extra || 0) > 0).length, color: "#F59E0B" },
              ].map(s => (
                <div key={s.label} style={card({ borderLeft: `3px solid ${s.color}` })}>
                  <p style={label}>{s.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, margin: 0, color: s.color }}>{s.valor}</p>
                </div>
              ))}
            </div>

            <div style={{ ...card(), marginBottom: 20 }}>
              <p style={{ ...label, marginBottom: 16 }}>Usuarios por ciudad</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {Object.entries(usuariosPorCiudad).sort((a, b) => b[1] - a[1]).map(([ciudad, cant]) => (
                  <div key={ciudad} style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 20, padding: "6px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{ciudad}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#2563EB" }}>{cant}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={card()}>
              <p style={{ ...label, marginBottom: 16 }}>Todos los usuarios</p>
              {users.map((u, i) => {
                const sub = subsActivas.find(s => s.user_id === u.id)
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexWrap: "wrap" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: u.avatar_url ? "transparent" : "linear-gradient(135deg, #2563EB, #7C3AED)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>
                      {u.avatar_url ? <img src={u.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (u.full_name?.[0] || "?")}
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{u.full_name || "Sin nombre"}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{u.email}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{u.city || ""} {u.province || ""} · {new Date(u.created_at).toLocaleDateString("es-AR")}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {u.dni_verificado && <span style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#22C55E" }}>DNI</span>}
                      {sub ? (
                        <span style={{ background: `${PLAN_COLOR[sub.plan] || "#888"}22`, border: `1px solid ${PLAN_COLOR[sub.plan] || "#888"}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: PLAN_COLOR[sub.plan] || "#888", textTransform: "capitalize" }}>
                          {sub.plan}
                        </span>
                      ) : (
                        <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Gratis</span>
                      )}
                      {(u.videos_extra || 0) > 0 && (
                        <span style={{ fontSize: 11, color: "#F59E0B" }}>+{u.videos_extra} videos</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === "propiedades" && (
          <div>
            <div style={grid("repeat(auto-fit, minmax(160px, 1fr))")}>
              {[
                { label: "Total publicadas", valor: properties.length, color: "#2563EB" },
                { label: "Vistas totales", valor: totalVistas, color: "#60A5FA" },
                { label: "Likes totales", valor: totalLikes, color: "#EF4444" },
                { label: "Contactos totales", valor: totalContactos, color: "#25D366" },
              ].map(s => (
                <div key={s.label} style={card({ borderLeft: `3px solid ${s.color}` })}>
                  <p style={label}>{s.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, margin: 0, color: s.color }}>{s.valor.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {properties.map(p => (
                <div key={p.id} style={{ ...card(), display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  {p.video_url && <video src={p.video_url} style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} muted />}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>{p.title || "Sin titulo"}</p>
                    <p style={{ margin: "0 0 2px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.operation_type?.toUpperCase()} · {p.property_type} · USD {Number(p.price).toLocaleString()}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{p.neighborhood} {p.city} · {p.owner_name}</p>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {[
                      { label: "Vistas", valor: p.views || 0, color: "#2563EB" },
                      { label: "Likes", valor: p.likes || 0, color: "#EF4444" },
                      { label: "Contactos", valor: p.contacts || 0, color: "#25D366" },
                      { label: "Guardados", valor: p.saves || 0, color: "#F59E0B" },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: m.color }}>{m.valor}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {p.verified && <span style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#22C55E" }}>GPS</span>}
                    {p.highlighted && <span style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#F59E0B" }}>DEST</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "suscripciones" && (
          <div>
            <div style={grid("repeat(auto-fit, minmax(160px, 1fr))")}>
              {[
                { label: "Activas", valor: subsActivas.length, color: "#22C55E" },
                { label: "MRR estimado", valor: `$${mrr.toLocaleString("es-AR")}`, color: "#F59E0B" },
                { label: "Vencen en 7 dias", valor: vencenProximo.length, color: "#EF4444" },
                { label: "Total pagos servicios", valor: `$${totalFacturado.toLocaleString("es-AR")}`, color: "#A855F7" },
              ].map(s => (
                <div key={s.label} style={card({ borderLeft: `3px solid ${s.color}` })}>
                  <p style={label}>{s.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 900, margin: 0, color: s.color }}>{s.valor}</p>
                </div>
              ))}
            </div>

            <div style={card()}>
              <p style={{ ...label, marginBottom: 16 }}>Suscripciones</p>
              {subscriptions.map((s, i) => {
                const u = users.find(u => u.id === s.user_id)
                const vence = new Date(s.fecha_vencimiento)
                const diasRestantes = Math.ceil((vence.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                const venceProximo = diasRestantes <= 7 && diasRestantes > 0
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < subscriptions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>{u?.full_name || u?.email || "Usuario"}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{u?.email}</p>
                    </div>
                    <span style={{ background: `${PLAN_COLOR[s.plan] || "#888"}22`, border: `1px solid ${PLAN_COLOR[s.plan] || "#888"}44`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: PLAN_COLOR[s.plan] || "#888", textTransform: "capitalize" }}>
                      {s.plan}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: venceProximo ? "#EF4444" : s.estado === "activo" ? "#22C55E" : "rgba(255,255,255,0.3)" }}>
                        {s.estado === "activo" ? (diasRestantes > 0 ? `${diasRestantes} dias` : "Vencida") : "Inactiva"}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Vence {vence.toLocaleDateString("es-AR")}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {pagos.length > 0 && (
              <div style={{ ...card(), marginTop: 16 }}>
                <p style={{ ...label, marginBottom: 16 }}>Pagos de servicios</p>
                {pagos.slice(0, 20).map((p, i) => {
                  const u = users.find(u => u.id === p.user_id)
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < Math.min(pagos.length, 20) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{u?.full_name || "Usuario"}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.servicio} · {new Date(p.fecha).toLocaleDateString("es-AR")}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#22C55E" }}>${Number(p.precio).toLocaleString("es-AR")}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === "moderacion" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {(["pending", "all", "approved", "rejected"] as const).map(f => (
                <button key={f} onClick={() => setFilterMod(f)} style={{
                  padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                  background: filterMod === f ? "#2563EB" : "rgba(255,255,255,0.08)",
                  color: filterMod === f ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: 13, fontWeight: 600,
                  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                }}>
                  {f === "pending" ? `Pendientes (${properties.filter(p => p.status === "pending").length})` :
                    f === "all" ? "Todas" :
                      f === "approved" ? "Aprobadas" : "Rechazadas"}
                </button>
              ))}
            </div>

            {propsFiltradas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 18, fontWeight: 700 }}>No hay propiedades pendientes</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {propsFiltradas.map(p => {
                  const sc = p.status === "approved"
                    ? { bg: "rgba(34,197,94,0.15)", color: "#22C55E", border: "rgba(34,197,94,0.3)" }
                    : p.status === "rejected"
                      ? { bg: "rgba(239,68,68,0.15)", color: "#EF4444", border: "rgba(239,68,68,0.3)" }
                      : { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "rgba(245,158,11,0.3)" }
                  return (
                    <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                      {p.video_url && <video src={p.video_url} controls style={{ width: "100%", maxHeight: 240, objectFit: "cover", background: "#000" }} />}
                      <div style={{ padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                            {p.status === "approved" ? "Aprobada" : p.status === "rejected" ? "Rechazada" : "Pendiente"}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{new Date(p.created_at).toLocaleDateString("es-AR")}</span>
                        </div>
                        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{p.title || "Sin titulo"}</h3>
                        <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{p.neighborhood} {p.city} · {p.owner_name}</p>
                        <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800 }}>USD {Number(p.price).toLocaleString()}</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          {["approved", "pending", "rejected"].map(st => (
                            <button key={st} onClick={() => updateStatus(p.id, st)} disabled={updating === p.id || p.status === st}
                              style={{
                                flex: 1, padding: "10px", borderRadius: 10, border: "none",
                                background: p.status === st
                                  ? st === "approved" ? "rgba(34,197,94,0.3)" : st === "rejected" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"
                                  : st === "approved" ? "#22C55E" : st === "rejected" ? "#EF4444" : "#F59E0B",
                                color: "#fff", fontSize: 13, fontWeight: 700,
                                cursor: p.status === st ? "default" : "pointer",
                                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                              }}>
                              {updating === p.id ? "..." : st === "approved" ? "Aprobar" : st === "pending" ? "Pendiente" : "Rechazar"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}