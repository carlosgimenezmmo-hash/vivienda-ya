"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

const planes = [
  { id: "gratis", nombre: "Gratis", precio: 0, periodo: "", color: "#888", features: ["3 videos por mes", "60 segundos por video", "Estadisticas basicas", "Verificacion ARRYSE gratis", "Chat con interesados"] },
  { id: "starter", nombre: "STARTER", precio: 14000, periodo: "por mes", color: "#22C55E", features: ["Canal propio con tu nombre", "Videos organizados en tu pagina", "Boton de contacto directo", "15 videos por mes", "60 segundos por video", "Estadisticas basicas", "Badge STARTER visible"] },
  { id: "pro", nombre: "PRO", precio: 35000, periodo: "por mes", color: "#2563EB", features: ["Todo lo del plan STARTER", "Badge verificado", "Descripcion de canal", "Link externo en tu perfil", "Hasta 5 colaboradores", "Estadisticas avanzadas", "50 videos por mes", "Videos hasta 5 minutos", "5 destacados por mes", "Soporte prioritario"] },
  { id: "elite", nombre: "ELITE", precio: 56000, periodo: "por mes", color: "#D97706", features: ["Todo lo del plan PRO", "Logo y colores de marca", "Hasta 10 colaboradores", "Prioridad absoluta en busquedas", "Badge dorado ELITE", "100 videos por mes", "10 destacados por mes", "4 lives por mes", "Soporte VIP menos de 1 hora"] },
]

const servicios = [
  { id: "video_1", nombre: "Video adicional", precio: 1400, desc: "1 video extra en el mes", videos: 1 },
  { id: "video_5", nombre: "Pack 5 videos", precio: 5600, desc: "5 videos adicionales (20% off)", videos: 5 },
  { id: "video_10", nombre: "Pack 10 videos", precio: 9800, desc: "10 videos adicionales (30% off)", videos: 10 },
  { id: "destacar_1d", nombre: "Destacar 24 horas", precio: 1400, desc: "Aparecer primero en el feed", videos: 0 },
  { id: "destacar_7d", nombre: "Destacar 7 dias", precio: 7000, desc: "Prioridad en el feed (30% off)", videos: 0 },
  { id: "live", nombre: "Live commerce", precio: 2800, desc: "Transmision en vivo 30 minutos", videos: 0 },
  { id: "desc_ia", nombre: "Descripcion con IA", precio: 1400, desc: "Gemini genera tu descripcion", videos: 0 },
  { id: "tasacion", nombre: "Tasacion express", precio: 7000, desc: "Estimacion de precio con IA", videos: 0 },
  { id: "informe", nombre: "Informe de mercado", precio: 2800, desc: "Reporte de precios por zona", videos: 0 },
]
const pagarMP = async (titulo: string, precio: number, planId: string) => {
  const res = await fetch("/api/pago", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo, precio, planId, userId: (await supabase.auth.getSession()).data.session?.user?.id }),
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
      starter: { titulo: "Plan STARTER - ViviendaYa", precio: 14000 },
pro: { titulo: "Plan PRO - ViviendaYa", precio: 35000 },
elite: { titulo: "Plan ELITE - ViviendaYa", precio: 56000 },
    const plan = planInfo[planId]
    if (!plan) return
    setPlanSeleccionado(planId)
    await pagarMP(plan.titulo, plan.precio, planId)
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", overflowY: "scroll" } as React.CSSProperties}>

      <div style={{ padding: "52px 20px 24px" }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>Elegi tu plan</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: 0 }}>Simple, justo y sin sorpresas</p>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
        {planes.map((plan) => (
          <div key={plan.id} style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${planSeleccionado === plan.id ? plan.color : "rgba(255,255,255,0.08)"}`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ background: plan.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 800, color: "#fff" }}>{plan.nombre}</span>
              <div style={{ marginTop: 12 }}>
                {plan.precio === 0 ? (
                  <span style={{ fontSize: 32, fontWeight: 900 }}>Gratis</span>
                ) : (
                  <>
                    <span style={{ fontSize: 32, fontWeight: 900 }}>$ {plan.precio.toLocaleString("es-AR")}</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>{plan.periodo}</span>
                  </>
                )}
              </div>
            </div>
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
            <div style={{ padding: "0 20px 20px" }}>
              <button onClick={() => handleContratar(plan.id)} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: plan.precio === 0 ? "rgba(255,255,255,0.1)" : plan.color, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                {plan.precio === 0 ? "Empezar gratis" : `Contratar ${plan.nombre}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 160px" }}>
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
                <span style={{ fontSize: 16, fontWeight: 800 }}>$ {s.precio.toLocaleString("es-AR")}</span>
                <button onClick={() => pagarMP(s.nombre, s.precio, s.id )} style={{ background: "#2563EB", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
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




