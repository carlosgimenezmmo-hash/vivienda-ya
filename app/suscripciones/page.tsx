"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

type Plan = "gratis" | "pro" | "premium" | "plus"

const planes = [
  {
    id: "gratis",
    nombre: "GRATIS",
    precio: "0",
    periodo: "",
    color: "#6B7280",
    colorBg: "rgba(107,114,128,0.08)",
    colorBorder: "rgba(107,114,128,0.2)",
    emoji: "🆓",
    features: [
      "3 videos por mes",
      "60 segundos por video",
      "Verificación ARRYSE incluida",
      "Chat con interesados",
      "Estadísticas básicas",
    ],
    limitaciones: [
      "Sin destacados",
      "Sin boost semanal",
    ],
  },
  {
    id: "pro",
    nombre: "PRO",
    precio: "1.50",
    periodo: "/semana",
    color: "#2563EB",
    colorBg: "rgba(37,99,235,0.08)",
    colorBorder: "rgba(37,99,235,0.3)",
    emoji: "⚡",
    badge: "7 DÍAS GRATIS",
    features: [
      "15 videos por mes",
      "60 segundos por video",
      "Verificación ARRYSE incluida",
      "1 destacado por semana",
      "Estadísticas avanzadas",
      "Ver quién vio tus propiedades",
      "Badge PRO en el feed",
      "Soporte prioritario",
    ],
    limitaciones: [],
  },
  {
    id: "premium",
    nombre: "INMOBILIARIA PREMIUM",
    precio: "25",
    periodo: "/mes",
    color: "#F59E0B",
    colorBg: "rgba(245,158,11,0.08)",
    colorBorder: "rgba(245,158,11,0.3)",
    emoji: "🏢",
    features: [
      "50 videos por mes",
      "Videos de hasta 5 minutos",
      "Hasta 5 agentes",
      "5 destacados por mes",
      "2 lives por mes",
      "Carga masiva de propiedades",
      "Badge INMOBILIARIA VERIFICADA",
      "API disponible",
      "Soporte VIP",
    ],
    limitaciones: [],
  },
  {
    id: "plus",
    nombre: "INMOBILIARIA PLUS",
    precio: "40",
    periodo: "/mes",
    color: "#8B5CF6",
    colorBg: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.3)",
    emoji: "👑",
    features: [
      "100 videos por mes",
      "Videos de hasta 5 minutos",
      "Hasta 10 agentes",
      "10 destacados por mes",
      "4 lives por mes",
      "Prioridad absoluta en búsquedas",
      "Todo lo de PREMIUM incluido",
    ],
    limitaciones: [],
  },
]

const extras = [
  { emoji: "⏱️", nombre: "60 segundos extra", sub: "Pasá de 60s a 120s en un video", precio: "USD 1.25", color: "#2563EB" },
  { emoji: "⏱️⏱️", nombre: "120 segundos extra", sub: "Pasá de 60s a 180s en un video", precio: "USD 2.00", color: "#2563EB" },
  { emoji: "⭐", nombre: "Destacado 24h", sub: "Tu propiedad aparece primera en el feed", precio: "USD 2.00", color: "#F59E0B" },
  { emoji: "🚀", nombre: "Boost semanal", sub: "Aparece 3 veces por día durante 7 días", precio: "USD 2.00", color: "#22C55E" },
  { emoji: "📱", nombre: "Contacto verificado", sub: "Mostrá tu WhatsApp a un interesado", precio: "USD 0.50", color: "#EC4899" },
]

export default function SuscripcionesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const planActual = (user?.level || "basico") as Plan

  const handleSeleccionar = (planId: Plan) => {
    if (planId === planActual) return
    setPlanSeleccionado(planId)
    setShowConfirm(true)
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 90 }}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Planes y Suscripciones</h1>
      </div>

      {/* FRASE CONCEPTO */}
      <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6 }}>
          Publicá en 2 minutos. Pagá solo si necesitás más.<br/>
          <span style={{ color: "#22C55E", fontWeight: 600 }}>Siempre con verificación ARRYSE gratuita.</span>
        </p>
      </div>

      {/* PLAN ACTUAL */}
      {isLoggedIn && (
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
            <p style={{ margin: 0, fontSize: 13, color: "#22C55E", fontWeight: 600 }}>
              Tu plan actual: {planActual.toUpperCase()}
            </p>
          </div>
        </div>
      )}

      {/* PLANES */}
      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {planes.map(plan => {
          const esActual = plan.id === planActual
          const p = plan as typeof planes[0] & { badge?: string }
          return (
            <div key={plan.id} style={{
              background: esActual ? plan.colorBg : "rgba(255,255,255,0.03)",
              border: `1px solid ${esActual ? plan.colorBorder : "rgba(255,255,255,0.08)"}`,
              borderRadius: 18, padding: "18px 16px",
              position: "relative", overflow: "hidden",
            }}>
              {/* Badge prueba gratis */}
              {p.badge && (
                <div style={{ position: "absolute", top: 14, right: 14, background: "#22C55E", borderRadius: 20, padding: "3px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#000" }}>{p.badge}</span>
                </div>
              )}

              {/* Header del plan */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{plan.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: plan.color }}>{plan.nombre}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginTop: 2 }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>
                      {plan.precio === "0" ? "Gratis" : `USD ${plan.precio}`}
                    </span>
                    {plan.periodo && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{plan.periodo}</span>}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div style={{ marginBottom: 14 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: plan.color, fontSize: 14, flexShrink: 0 }}>✓</span>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{f}</p>
                  </div>
                ))}
                {plan.limitaciones.map(l => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, flexShrink: 0 }}>✕</span>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>{l}</p>
                  </div>
                ))}
              </div>

              {/* Botón */}
              {esActual ? (
                <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 700 }}>✓ Tu plan actual</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSeleccionar(plan.id as Plan)}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 12, border: "none",
                    background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                    color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {plan.id === "pro" ? "Probar 7 días gratis →" : `Activar ${plan.nombre} →`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* EXTRAS */}
      <div style={{ padding: "28px 20px 0" }}>
        <p style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Servicios adicionales</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>Pagos únicos · Sin suscripción</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {extras.map(extra => (
            <div key={extra.nombre} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{extra.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{extra.nombre}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{extra.sub}</p>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: extra.color }}>{extra.precio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PUBLICIDAD */}
      <div style={{ padding: "28px 20px 0" }}>
        <p style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Publicidad en el feed</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>Tu propiedad o inmobiliaria entre los videos</p>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px" }}>
          {[
            { zona: "Local (1 barrio)", precio: "USD 50/semana" },
            { zona: "Ciudad completa", precio: "USD 100/semana" },
            { zona: "Provincia", precio: "USD 200/semana" },
          ].map(p => (
            <div key={p.zona} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>📍 {p.zona}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{p.precio}</p>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 10, paddingTop: 10 }}>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              📺 Aparece cada 10 videos en el feed · Formato video igual que las propiedades
            </p>
          </div>
          <button style={{
            width: "100%", marginTop: 14, padding: "12px", borderRadius: 12, border: "none",
            background: "rgba(245,158,11,0.15)", color: "#F59E0B",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            border: "1px solid rgba(245,158,11,0.25)",
          }}>
            Consultar publicidad →
          </button>
        </div>
      </div>

      {/* MODAL CONFIRMAR PLAN */}
      {showConfirm && planSeleccionado && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={() => setShowConfirm(false)}>
          <div style={{ width: "100%", maxWidth: 430, background: "#1a1a1a", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", textAlign: "center" }}>
              {planes.find(p => p.id === planSeleccionado)?.emoji} {planes.find(p => p.id === planSeleccionado)?.nombre}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", margin: "0 0 24px" }}>
              {planSeleccionado === "pro" ? "7 días gratis, después USD 1.50/semana" :
               planSeleccionado === "premium" ? "USD 25/mes · Renovación automática" :
               "USD 40/mes · Renovación automática"}
            </p>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                💳 El pago se procesa de forma segura. Podés cancelar en cualquier momento desde Configuración.
              </p>
            </div>
            <button style={{
              width: "100%", padding: "15px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
              marginBottom: 10, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}>
              {planSeleccionado === "pro" ? "Activar prueba gratis →" : "Confirmar suscripción →"}
            </button>
            <button onClick={() => setShowConfirm(false)} style={{
              width: "100%", padding: "15px", borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
