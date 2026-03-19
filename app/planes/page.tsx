"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const planes = [
  {
    id: "gratis",
    nombre: "Gratis",
    precio: 0,
    periodo: "",
    color: "#888",
    features: [
      "3 videos por mes",
      "60 segundos por video",
      "Estadisticas basicas",
      "Verificacion ARRYSE gratis",
      "Chat con interesados",
    ],
  },
  {
    id: "pro",
    nombre: "PRO",
    precio: 1.5,
    periodo: "por semana",
    color: "#2563EB",
    features: [
      "15 videos por mes",
      "60 segundos por video",
      "Estadisticas avanzadas",
      "Ver quien vio tus propiedades",
      "Badge PRO visible",
      "1 destacado por semana (24h)",
      "Soporte prioritario",
    ],
  },
  {
    id: "premium",
    nombre: "PREMIUM",
    precio: 25,
    periodo: "por mes",
    color: "#7C3AED",
    features: [
      "50 videos por mes",
      "Videos de hasta 5 minutos",
      "Hasta 5 agentes incluidos",
      "Dashboard profesional",
      "5 destacados por mes",
      "2 lives por mes",
      "API de integracion",
      "Carga masiva Excel/CSV",
      "Informes de mercado mensuales",
      "Badge INMOBILIARIA VERIFICADA",
      "Soporte VIP menos de 1 hora",
    ],
  },
  {
    id: "plus",
    nombre: "PLUS",
    precio: 40,
    periodo: "por mes",
    color: "#D97706",
    features: [
      "100 videos por mes",
      "Videos de hasta 5 minutos",
      "Hasta 10 agentes incluidos",
      "10 destacados por mes",
      "4 lives por mes",
      "Prioridad absoluta en busquedas",
      "Todo lo del plan PREMIUM incluido",
    ],
  },
]

const servicios = [
  { nombre: "Video adicional", precio: 1, desc: "1 video extra en el mes" },
  { nombre: "Pack 5 videos", precio: 4, desc: "5 videos adicionales (20% off)" },
  { nombre: "Pack 10 videos", precio: 7, desc: "10 videos adicionales (30% off)" },
  { nombre: "Destacar 24 horas", precio: 1, desc: "Aparecer primero en el feed" },
  { nombre: "Destacar 7 dias", precio: 5, desc: "Prioridad en el feed (30% off)" },
  { nombre: "Live commerce", precio: 2, desc: "Transmision en vivo 30 minutos" },
  { nombre: "Descripcion con IA", precio: 1, desc: "Gemini genera tu descripcion" },
  { nombre: "Tasacion express", precio: 5, desc: "Estimacion de precio con IA" },
  { nombre: "Informe de mercado", precio: 2, desc: "Reporte de precios por zona" },
]

export default function PlanesPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null)

  const handleContratar = (planId: string) => {
    if (!isLoggedIn) {
      router.push("/registro")
      return
    }
    if (planId === "gratis") {
      router.push("/publicar")
      return
    }
    setPlanSeleccionado(planId)
    alert("Mercado Pago proximamente")
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 24px" }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>
          Elegí tu plan
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Simple, justo y sin sorpresas
        </p>
      </div>

      {/* PLANES */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
        {planes.map((plan) => (
          <div key={plan.id} style={{
            background: "rgba(255,255,255,0.04)",
            border: `2px solid ${planSeleccionado === plan.id ? plan.color : "rgba(255,255,255,0.08)"}`,
            borderRadius: 20, overflow: "hidden",
          }}>
            {/* Header del plan */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ background: plan.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                    {plan.nombre}
                  </span>
                  <div style={{ marginTop: 12 }}>
                    {plan.precio === 0 ? (
                      <span style={{ fontSize: 32, fontWeight: 900 }}>Gratis</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 32, fontWeight: 900 }}>USD {plan.precio}</span>
                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>{plan.periodo}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div style={{ padding: "16px 20px" }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: plan.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Boton */}
            <div style={{ padding: "0 20px 20px" }}>
              <button onClick={() => handleContratar(plan.id)} style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "none",
                background: plan.precio === 0 ? "rgba(255,255,255,0.1)" : plan.color,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}>
                {plan.precio === 0 ? "Empezar gratis" : `Contratar ${plan.nombre}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SERVICIOS PUNTUALES */}
      <div style={{ padding: "0 20px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>Servicios puntuales</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>Paga solo lo que necesitas</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {servicios.map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{s.nombre}</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.desc}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>USD {s.precio}</span>
                <button onClick={() => alert("Mercado Pago proximamente")} style={{ background: "#2563EB", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
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