"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const planes = [
  {
    id: "gratis",
    nombre: "Gratis",
    precio: 0,
    color: "#888",
    colorBg: "rgba(136,136,136,0.1)",
    videosActivos: 3,
    duracion: "60 seg",
    destacados: 0,
    dashboard: false,
    analiticas: false,
    multiagente: false,
    soporte: false,
    features: [
      "3 videos activos simultaneos",
      "60 segundos por video",
      "Verificacion ARRYSE gratis",
      "Chat con interesados",
      "Canal basico",
    ],
  },
  {
    id: "plata",
    nombre: "Plata",
    precio: 11200,
    color: "#94A3B8",
    colorBg: "rgba(148,163,184,0.1)",
    videosActivos: 10,
    duracion: "2 min",
    destacados: 1,
    dashboard: true,
    analiticas: false,
    multiagente: false,
    soporte: false,
    features: [
      "10 videos activos simultaneos",
      "Videos hasta 2 minutos",
      "1 destacado por mes",
      "Canal con logo propio",
      "Badge Plata visible",
      "Estadisticas de vistas",
      "Verificacion ARRYSE gratis",
    ],
  },
  {
    id: "oro",
    nombre: "Oro",
    precio: 28000,
    color: "#F59E0B",
    colorBg: "rgba(245,158,11,0.1)",
    videosActivos: 25,
    duracion: "3 min",
    destacados: 3,
    dashboard: true,
    analiticas: true,
    multiagente: false,
    soporte: false,
    features: [
      "25 videos activos simultaneos",
      "Videos hasta 3 minutos",
      "3 destacados por mes",
      "Todo lo del plan Plata",
      "Dashboard con metricas por propiedad",
      "Prioridad en busquedas",
      "Badge Oro visible",
      "Link externo en perfil",
    ],
  },
  {
    id: "platino",
    nombre: "Platino",
    precio: 63000,
    color: "#2563EB",
    colorBg: "rgba(37,99,235,0.1)",
    videosActivos: 60,
    duracion: "5 min",
    destacados: 5,
    dashboard: true,
    analiticas: true,
    multiagente: true,
    soporte: true,
    features: [
      "60 videos activos simultaneos",
      "Videos hasta 5 minutos",
      "5 destacados por mes",
      "Todo lo del plan Oro",
      "Reportes para clientes",
      "Multi-agente hasta 3 personas",
      "Soporte por WhatsApp",
      "Badge Platino visible",
    ],
  },
  {
    id: "diamante",
    nombre: "Diamante",
    precio: 112000,
    color: "#A855F7",
    colorBg: "rgba(168,85,247,0.1)",
    videosActivos: 120,
    duracion: "5 min",
    destacados: 10,
    dashboard: true,
    analiticas: true,
    multiagente: true,
    soporte: true,
    features: [
      "120 videos activos simultaneos",
      "Videos hasta 5 minutos",
      "10 destacados por mes",
      "Todo lo del plan Platino",
      "Analiticas por zona y barrio",
      "Multi-agente ilimitado",
      "API para sincronizar cartera",
      "Aparicion destacada permanente",
      "Badge Diamante exclusivo",
    ],
  },
]

const servicios = [
  { id: "video_1", nombre: "Video adicional", precio: 1400, desc: "1 video activo extra" },
  { id: "video_5", nombre: "Pack 5 videos", precio: 5600, desc: "5 videos activos (20% off)" },
  { id: "video_10", nombre: "Pack 10 videos", precio: 9800, desc: "10 videos activos (30% off)" },
  { id: "destacar_1d", nombre: "Destacar 24 horas", precio: 1400, desc: "Aparecer primero en el feed" },
  { id: "destacar_7d", nombre: "Destacar 7 dias", precio: 7000, desc: "Prioridad en el feed (30% off)" },
  { id: "tasacion", nombre: "Tasacion express", precio: 7000, desc: "Estimacion de precio con IA" },
  { id: "informe", nombre: "Informe de mercado", precio: 2800, desc: "Reporte de precios por zona" },
]

const pagarMP = async (titulo: string, precio: number, planId: string) => {
  const res = await fetch("/api/pago", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo,
      precio,
      planId,
      userId: (await supabase.auth.getSession()).data.session?.user?.id,
    }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else alert("Error al procesar el pago.")
}

export default function PlanesPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null)
  const [vista, setVista] = useState<"cards" | "tabla">("cards")

  const handleContratar = async (planId: string) => {
    if (!isLoggedIn) { router.push("/registro"); return }
    if (planId === "gratis") { router.push("/publicar"); return }
    const planInfo: Record<string, { titulo: string; precio: number }> = {
      plata: { titulo: "Plan Plata - ViviendaYa", precio: 11200 },
      oro: { titulo: "Plan Oro - ViviendaYa", precio: 28000 },
      platino: { titulo: "Plan Platino - ViviendaYa", precio: 63000 },
      diamante: { titulo: "Plan Diamante - ViviendaYa", precio: 112000 },
    }
    const plan = planInfo[planId]
    setPlanSeleccionado(planId)
    await pagarMP(plan.titulo, plan.precio, planId)
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 100,
    }}>

      {/* HEADER */}
      <div style={{ padding: "52px 24px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{
          background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
          width: 38, height: 38, color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>Elegi tu plan</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Paga por los videos activos que necesitas. Sin sorpresas.
            </p>
          </div>

          {/* TOGGLE VISTA */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.06)",
            borderRadius: 10, padding: 4, gap: 4,
          }}>
            {(["cards", "tabla"] as const).map((v) => (
              <button key={v} onClick={() => setVista(v)} style={{
                padding: "8px 18px", borderRadius: 8, border: "none",
                background: vista === v ? "rgba(255,255,255,0.12)" : "transparent",
                color: vista === v ? "#fff" : "rgba(255,255,255,0.4)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}>
                {v === "cards" ? "Cards" : "Comparar"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VISTA CARDS */}
      {vista === "cards" && (
        <div style={{
          padding: "0 24px",
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 48,
        }}>
          {planes.map((plan) => (
            <div key={plan.id} style={{
              background: planSeleccionado === plan.id ? plan.colorBg : "rgba(255,255,255,0.03)",
              border: `2px solid ${planSeleccionado === plan.id ? plan.color : "rgba(255,255,255,0.08)"}`,
              borderRadius: 20,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "border-color 0.2s",
            }}>

              {/* CABECERA */}
              <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{
                    background: plan.color, borderRadius: 20,
                    padding: "4px 14px", fontSize: 13, fontWeight: 800, color: "#fff",
                  }}>{plan.nombre}</span>
                  {plan.id === "oro" && (
                    <span style={{
                      background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)",
                      borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#F59E0B",
                    }}>MAS POPULAR</span>
                  )}
                </div>

                {plan.precio === 0 ? (
                  <p style={{ fontSize: 36, fontWeight: 900, margin: 0 }}>Gratis</p>
                ) : (
                  <div>
                    <p style={{ fontSize: 36, fontWeight: 900, margin: 0 }}>
                      $ {plan.precio.toLocaleString("es-AR")}
                    </p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>por mes</p>
                  </div>
                )}

                {/* STATS RAPIDOS */}
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <div style={{ textAlign: "center", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 8px" }}>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: plan.color }}>{plan.videosActivos}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>videos activos</p>
                  </div>
                  <div style={{ textAlign: "center", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 8px" }}>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: plan.color }}>{plan.duracion}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>por video</p>
                  </div>
                  <div style={{ textAlign: "center", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 8px" }}>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: plan.color }}>{plan.destacados}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>destacados</p>
                  </div>
                </div>
              </div>

              {/* FEATURES */}
              <div style={{ padding: "20px 24px", flex: 1 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: plan.color, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* BOTON */}
              <div style={{ padding: "0 24px 24px" }}>
                <button
                  onClick={() => handleContratar(plan.id)}
                  style={{
                    width: "100%", padding: "15px", borderRadius: 14, border: "none",
                    background: plan.precio === 0 ? "rgba(255,255,255,0.1)" : plan.color,
                    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                    opacity: planSeleccionado === plan.id ? 0.7 : 1,
                  }}
                >
                  {planSeleccionado === plan.id ? "Procesando..." :
                    plan.precio === 0 ? "Empezar gratis" : `Contratar ${plan.nombre}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA TABLA COMPARATIVA */}
      {vista === "tabla" && (
        <div style={{ padding: "0 24px", maxWidth: 1100, margin: "0 auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, width: "30%" }}>
                  Caracteristica
                </th>
                {planes.map((p) => (
                  <th key={p.id} style={{ textAlign: "center", padding: "12px 8px" }}>
                    <span style={{
                      display: "inline-block", background: p.color,
                      borderRadius: 20, padding: "4px 14px",
                      fontSize: 12, fontWeight: 800, color: "#fff",
                    }}>{p.nombre}</span>
                    <p style={{ margin: "8px 0 0", fontSize: 15, fontWeight: 800, color: "#fff" }}>
                      {p.precio === 0 ? "Gratis" : `$${(p.precio / 1000).toFixed(0)}K`}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Videos activos", key: "videosActivos" },
                { label: "Duracion por video", key: "duracion" },
                { label: "Destacados por mes", key: "destacados" },
                { label: "Dashboard metricas", key: "dashboard" },
                { label: "Analiticas por zona", key: "analiticas" },
                { label: "Multi-agente", key: "multiagente" },
                { label: "Soporte WhatsApp", key: "soporte" },
              ].map((row, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    {row.label}
                  </td>
                  {planes.map((p) => {
                    const val = (p as any)[row.key]
                    return (
                      <td key={p.id} style={{ textAlign: "center", padding: "14px 8px" }}>
                        {typeof val === "boolean" ? (
                          val ? (
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          ) : (
                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 18 }}>—</span>
                          )
                        ) : (
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{val}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "20px 16px" }}></td>
                {planes.map((p) => (
                  <td key={p.id} style={{ textAlign: "center", padding: "20px 8px" }}>
                    <button
                      onClick={() => handleContratar(p.id)}
                      style={{
                        padding: "10px 16px", borderRadius: 12, border: "none",
                        background: p.precio === 0 ? "rgba(255,255,255,0.1)" : p.color,
                        color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.precio === 0 ? "Gratis" : "Contratar"}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* SERVICIOS PUNTUALES */}
      <div style={{ padding: "40px 24px 0", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Servicios puntuales</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>
          Paga solo lo que necesitas, cuando lo necesitas
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 10,
        }}>
          {servicios.map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{s.nombre}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.desc}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>
                  $ {s.precio.toLocaleString("es-AR")}
                </span>
                <button
                  onClick={() => pagarMP(s.nombre, s.precio, s.id)}
                  style={{
                    background: "#2563EB", border: "none", borderRadius: 10,
                    padding: "8px 14px", color: "#fff", fontSize: 13,
                    fontWeight: 700, cursor: "pointer",
                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}