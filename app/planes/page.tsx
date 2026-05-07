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
    features: [
      "3 videos activos simultáneos",
      "60 segundos por video",
      "Verificación ARRYSE gratis",
      "Chat con interesados",
      "Canal básico",
    ],
  },
  {
    id: "junior",
    nombre: "Junior",
    precio: 25000,
    color: "#94A3B8",
    colorBg: "rgba(148,163,184,0.1)",
    videosActivos: 10,
    duracion: "2 min",
    destacados: 1,
    features: [
      "10 videos activos simultáneos",
      "Videos hasta 2 minutos",
      "1 destacado por mes",
      "Canal con logo propio",
      "Badge Junior visible",
      "Estadísticas de vistas",
      "Verificación ARRYSE gratis",
    ],
  },
  {
    id: "agente",
    nombre: "Agente",
    precio: 50000,
    color: "#F59E0B",
    colorBg: "rgba(245,158,11,0.1)",
    videosActivos: 25,
    duracion: "3 min",
    destacados: 3,
    features: [
      "25 videos activos simultáneos",
      "Videos hasta 3 minutos",
      "3 destacados por mes",
      "Todo lo del plan Junior",
      "Dashboard con métricas por propiedad",
      "Prioridad en búsquedas",
      "Badge Agente visible",
      "Link externo en perfil",
    ],
  },
  {
    id: "especializado",
    nombre: "Especializado",
    precio: 80000,
    color: "#2563EB",
    colorBg: "rgba(37,99,235,0.1)",
    videosActivos: 60,
    duracion: "5 min",
    destacados: 5,
    features: [
      "60 videos activos simultáneos",
      "Videos hasta 5 minutos",
      "5 destacados por mes",
      "Todo lo del plan Agente",
      "Reportes para clientes",
      "Multi-agente hasta 3 personas",
      "Soporte por WhatsApp",
      "Badge Especializado visible",
    ],
  },
  {
    id: "senior",
    nombre: "Senior",
    precio: 150000,
    color: "#A855F7",
    colorBg: "rgba(168,85,247,0.1)",
    videosActivos: 120,
    duracion: "5 min",
    destacados: 10,
    features: [
      "120 videos activos simultáneos",
      "Videos hasta 5 minutos",
      "10 destacados por mes",
      "Todo lo del plan Especializado",
      "Analíticas por zona y barrio",
      "Multi-agente ilimitado",
      "API para sincronizar cartera",
      "Aparición destacada permanente",
      "Badge Senior exclusivo",
    ],
  },
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

  const handleContratar = async (planId: string) => {
    if (!isLoggedIn) { router.push("/registro"); return }
    if (planId === "gratis") { router.push("/publicar"); return }
    const planInfo: Record<string, { titulo: string; precio: number }> = {
      junior: { titulo: "Plan Junior - ViviendaYa", precio: 25000 },
      agente: { titulo: "Plan Agente - ViviendaYa", precio: 50000 },
      especializado: { titulo: "Plan Especializado - ViviendaYa", precio: 80000 },
      senior: { titulo: "Plan Senior - ViviendaYa", precio: 150000 },
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
      <div style={{ padding: "52px 24px 32px", maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{
          background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
          width: 38, height: 38, color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>Elegí tu plan</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Pagá por lo que necesitás. Sin sorpresas.
        </p>
      </div>

      {/* CARDS */}
      <div style={{
        padding: "0 24px",
        maxWidth: 700,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        {planes.map((plan) => (
          <div key={plan.id} style={{
            background: planSeleccionado === plan.id ? plan.colorBg : "rgba(255,255,255,0.03)",
            border: `2px solid ${planSeleccionado === plan.id ? plan.color : "rgba(255,255,255,0.08)"}`,
            borderRadius: 20,
            overflow: "hidden",
          }}>

            {/* CABECERA */}
            <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{
                  background: plan.color, borderRadius: 20,
                  padding: "4px 14px", fontSize: 13, fontWeight: 800, color: "#fff",
                }}>{plan.nombre}</span>
                {plan.id === "agente" && (
                  <span style={{
                    background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)",
                    borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#F59E0B",
                  }}>MÁS POPULAR</span>
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

              {/* STATS */}
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
            <div style={{ padding: "20px 24px" }}>
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

            {/* BOTÓN */}
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
    </div>
  )
}