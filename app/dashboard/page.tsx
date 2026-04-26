"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface Property {
  id: number
  title: string
  operation_type: string
  property_type: string
  price: number
  city: string
  neighborhood: string
  views: number
  likes: number
  saves: number
  contacts: number
  verified: boolean
  highlighted: boolean
  created_at: string
  video_url: string
}

const PLAN_NIVEL: Record<string, number> = {
  gratis: 0,
  plata: 1,
  oro: 2,
  platino: 3,
  diamante: 4,
}

export default function DashboardPage() {
  const { user, isLoggedIn, plan } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"resumen" | "propiedades" | "zonas">("resumen")
  // ✅ Estados para eliminar
  const [confirmarId, setConfirmarId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const nivel = PLAN_NIVEL[plan] ?? 0
  const puedeVerContactos = nivel >= 1
  const puedeVerPropiedades = nivel >= 1
  const puedeVerZonas = nivel >= 2

  useEffect(() => {
    if (!isLoggedIn) { router.push("/registro"); return }
    fetchData()
  }, [isLoggedIn])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id
      if (!uid) return
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
      setProperties(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Handler de eliminación conectado a Supabase
  const handleDelete = async (id: number) => {
    setConfirmarId(null)
    setDeleting(id)
    const { error } = await supabase.from("properties").delete().eq("id", id)
    if (!error) setProperties(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const totalVistas = properties.reduce((a, p) => a + (p.views || 0), 0)
  const totalLikes = properties.reduce((a, p) => a + (p.likes || 0), 0)
  const totalContactos = properties.reduce((a, p) => a + (p.contacts || 0), 0)
  const totalGuardados = properties.reduce((a, p) => a + (p.saves || 0), 0)
  const propActivas = properties.length

  const mejorPropiedad = properties.reduce((best, p) =>
    (p.views || 0) > (best?.views || 0) ? p : best, properties[0])

  const zonas = properties.reduce((acc: Record<string, { vistas: number; propiedades: number; likes: number }>, p) => {
    const zona = p.city || "Sin ciudad"
    if (!acc[zona]) acc[zona] = { vistas: 0, propiedades: 0, likes: 0 }
    acc[zona].vistas += p.views || 0
    acc[zona].propiedades += 1
    acc[zona].likes += p.likes || 0
    return acc
  }, {})

  const planColor: Record<string, string> = {
    gratis: "#888",
    plata: "#94A3B8",
    oro: "#F59E0B",
    platino: "#2563EB",
    diamante: "#A855F7",
  }

  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100dvh",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 100,
    },
    card: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "20px",
    },
    label: {
      fontSize: 12,
      color: "rgba(255,255,255,0.4)",
      fontWeight: 600,
      letterSpacing: 0.5,
      margin: "0 0 6px",
      textTransform: "uppercase" as const,
    },
    locked: {
      background: "rgba(255,255,255,0.02)",
      border: "1px dashed rgba(255,255,255,0.1)",
      borderRadius: 16,
      padding: "32px 20px",
      textAlign: "center" as const,
    },
  }

  const LockedSection = ({ mensaje, planRequerido }: { mensaje: string; planRequerido: string }) => (
    <div style={s.locked}>
      <p style={{ fontSize: 28, margin: "0 0 12px" }}>🔒</p>
      <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 15 }}>{mensaje}</p>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        Disponible desde el plan {planRequerido}
      </p>
      <button onClick={() => router.push("/planes")} style={{
        padding: "10px 24px", borderRadius: 12, border: "none",
        background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 700,
        cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        Ver planes
      </button>
      {/* ✅ Acceso directo a Mis Publicaciones para eliminar desde cualquier plan */}
      <p style={{ margin: "16px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        Para eliminar publicaciones,{" "}
        <span
          onClick={() => router.push("/mis-publicaciones")}
          style={{ color: "#60A5FA", cursor: "pointer", textDecoration: "underline" }}
        >
          ir a Mis Publicaciones
        </span>
      </p>
    </div>
  )

  if (loading) return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
          Vivienda<span style={{ color: "#22C55E" }}>Ya</span>
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Cargando tu dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={{ padding: "52px 24px 24px", maxWidth: 1100, margin: "0 auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <button onClick={() => router.back()} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
            width: 38, height: 38, color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>
              {propActivas} {propActivas === 1 ? "propiedad activa" : "propiedades activas"}
            </p>
          </div>

          {/* BADGE PLAN */}
          <span style={{
            background: planColor[plan] || "#888",
            borderRadius: 20, padding: "6px 14px",
            fontSize: 12, fontWeight: 800, color: "#fff",
            textTransform: "capitalize",
          }}>
            {plan}
          </span>

          <button onClick={() => router.push("/publicar")} style={{
            padding: "10px 18px", borderRadius: 12, border: "none",
            background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}>
            + Publicar
          </button>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4 }}>
          {(["resumen", "propiedades", "zonas"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: tab === t ? "rgba(255,255,255,0.12)" : "transparent",
              color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}>
              {t === "resumen" ? "Resumen" : t === "propiedades" ? "Mis propiedades" : "Por zona"}
              {t === "propiedades" && !puedeVerPropiedades && " 🔒"}
              {t === "zonas" && !puedeVerZonas && " 🔒"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>

        {/* TAB RESUMEN */}
        {tab === "resumen" && (
          <div>
            {/* STATS */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12, marginBottom: 24,
            }}>
              {[
                { label: "Vistas totales", valor: totalVistas, color: "#2563EB", icono: "👁", libre: true },
                { label: "Likes", valor: totalLikes, color: "#EF4444", icono: "❤️", libre: true },
                { label: "Contactos WhatsApp", valor: totalContactos, color: "#25D366", icono: "📞", libre: puedeVerContactos },
                { label: "Guardados", valor: totalGuardados, color: "#F59E0B", icono: "🔖", libre: puedeVerContactos },
              ].map((stat) => (
                <div key={stat.label} style={{
                  ...s.card,
                  borderLeft: `3px solid ${stat.libre ? stat.color : "rgba(255,255,255,0.1)"}`,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {!stat.libre && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(10,10,10,0.85)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      borderRadius: 16,
                    }}>
                      <span style={{ fontSize: 20 }}>🔒</span>
                      <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Plan Plata</p>
                    </div>
                  )}
                  <p style={s.label}>{stat.icono} {stat.label}</p>
                  <p style={{ fontSize: 36, fontWeight: 900, margin: 0, color: stat.color }}>
                    {stat.libre ? stat.valor.toLocaleString() : "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* MEJOR PROPIEDAD */}
            {mejorPropiedad && puedeVerContactos && (
              <div style={{ ...s.card, marginBottom: 24 }}>
                <p style={{ ...s.label, marginBottom: 16 }}>⭐ Propiedad con mas vistas</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  {mejorPropiedad.video_url && (
                    <video src={mejorPropiedad.video_url} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} muted />
                  )}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 16 }}>{mejorPropiedad.title || "Sin titulo"}</p>
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                      {mejorPropiedad.neighborhood} {mejorPropiedad.city}
                    </p>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {[
                        { label: "Vistas", valor: mejorPropiedad.views || 0, color: "#2563EB" },
                        { label: "Likes", valor: mejorPropiedad.likes || 0, color: "#EF4444" },
                        { label: "Guardados", valor: mejorPropiedad.saves || 0, color: "#F59E0B" },
                      ].map((m) => (
                        <div key={m.label}>
                          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: m.color }}>{m.valor}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TIPS */}
            <div style={{ ...s.card, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <p style={{ ...s.label, color: "#60A5FA" }}>💡 Tips para mejorar tu rendimiento</p>
              {[
                propActivas < 3 ? "Publica mas propiedades para aumentar tu visibilidad en el feed" : null,
                !puedeVerContactos ? "Mejora al plan Plata para ver cuantas consultas recibis por WhatsApp" : null,
                totalVistas < 100 ? "Destaca tus propiedades para aparecer primero en el feed" : null,
                "Compartir tus propiedades en redes sociales multiplica las vistas",
              ].filter(Boolean).slice(0, 3).map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ color: "#2563EB", flexShrink: 0 }}>→</span>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB PROPIEDADES */}
        {tab === "propiedades" && (
          !puedeVerPropiedades ? (
            <LockedSection mensaje="Gestion detallada de propiedades" planRequerido="Plata" />
          ) : (
            <div>
              {properties.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>🏠</p>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>No tenes propiedades publicadas</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>
                    Publica tu primera propiedad y empeza a recibir consultas
                  </p>
                  <button onClick={() => router.push("/publicar")} style={{
                    padding: "14px 28px", borderRadius: 14, border: "none",
                    background: "#2563EB", color: "#fff", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  }}>
                    Publicar ahora
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {properties.map((p) => (
                    <div key={p.id} style={{ ...s.card, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                      {p.video_url && (
                        <video src={p.video_url} style={{ width: 70, height: 70, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} muted />
                      )}
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{p.title || "Sin titulo"}</p>
                          {p.highlighted && (
                            <span style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#F59E0B" }}>DESTACADO</span>
                          )}
                          {p.verified && (
                            <span style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#10B981" }}>GPS</span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                          {p.operation_type?.toUpperCase()} · {p.property_type} · USD {Number(p.price).toLocaleString()}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        {[
                          { label: "Vistas", valor: p.views || 0, color: "#2563EB" },
                          { label: "Likes", valor: p.likes || 0, color: "#EF4444" },
                          { label: "Guardados", valor: p.saves || 0, color: "#F59E0B" },
                          { label: "Contactos", valor: p.contacts || 0, color: "#25D366" },
                        ].map((m) => (
                          <div key={m.label} style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: m.color }}>{m.valor}</p>
                            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{m.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* ✅ Botón eliminar en cada card */}
                      <button
                        onClick={() => setConfirmarId(p.id)}
                        disabled={deleting === p.id}
                        style={{
                          padding: "8px 16px", borderRadius: 10, flexShrink: 0,
                          border: "1px solid rgba(239,68,68,0.3)",
                          background: "rgba(239,68,68,0.1)",
                          color: "#FCA5A5", fontSize: 13, fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                        }}
                      >
                        {deleting === p.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* TAB ZONAS */}
        {tab === "zonas" && (
          !puedeVerZonas ? (
            <LockedSection mensaje="Analiticas por zona y ciudad" planRequerido="Oro" />
          ) : (
            <div>
              {Object.keys(zonas).length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Sin datos de zonas todavia</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                    Publica propiedades con ciudad para ver las analiticas por zona
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ ...s.label, marginBottom: 8 }}>Rendimiento por ciudad</p>
                  {Object.entries(zonas)
                    .sort((a, b) => b[1].vistas - a[1].vistas)
                    .map(([zona, data]) => {
                      const maxVistas = Math.max(...Object.values(zonas).map(z => z.vistas), 1)
                      const pct = Math.round((data.vistas / maxVistas) * 100)
                      return (
                        <div key={zona} style={s.card}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>📍 {zona}</p>
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                                {data.propiedades} {data.propiedades === 1 ? "propiedad" : "propiedades"}
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: 20 }}>
                              <div style={{ textAlign: "center" }}>
                                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#2563EB" }}>{data.vistas}</p>
                                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>vistas</p>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#EF4444" }}>{data.likes}</p>
                                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>likes</p>
                              </div>
                            </div>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
                            <div style={{
                              height: "100%", borderRadius: 3,
                              background: "linear-gradient(90deg, #2563EB, #60A5FA)",
                              width: `${pct}%`,
                            }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )
        )}

      </div>

      {/* ✅ Modal de confirmación para eliminar */}
      {confirmarId !== null && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={() => setConfirmarId(null)}
        >
          <div
            style={{ background: "#1a1a1a", borderRadius: "24px 24px 0 0", padding: "28px 24px 48px", width: "100%", maxWidth: 500 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", margin: "0 auto 24px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: "0 0 8px", textAlign: "center" }}>Eliminar propiedad</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, textAlign: "center", margin: "0 0 28px" }}>Esta accion no se puede deshacer.</p>
            <button
              onClick={() => handleDelete(confirmarId)}
              style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#EF4444", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12, fontFamily: "inherit" }}
            >
              {deleting === confirmarId ? "Eliminando..." : "Si, eliminar"}
            </button>
            <button
              onClick={() => setConfirmarId(null)}
              style={{ width: "100%", padding: "16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}