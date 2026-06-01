"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

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
  const [planes, setPlanes] = useState<any[]>([])
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPlanes() }, [])

  const fetchPlanes = async () => {
    const { data } = await supabase
      .from("planes")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true })
    setPlanes(data || [])
    setLoading(false)
  }

  const handleContratar = async (planId: string, precio: number, nombre: string) => {
    if (!isLoggedIn) { router.push("/registro"); return }
    setPlanSeleccionado(planId)
    await pagarMP(`Plan ${nombre} - ViviendaYa`, precio, planId)
  }

  if (loading) return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Cargando planes...</p>
    </div>
  )

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 100,
    }}>

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
            background: planSeleccionado === plan.id ? plan.color_bg : "rgba(255,255,255,0.03)",
            border: `2px solid ${planSeleccionado === plan.id ? plan.color : "rgba(255,255,255,0.08)"}`,
            borderRadius: 20,
            overflow: "hidden",
          }}>

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

              <div>
                <p style={{ fontSize: 36, fontWeight: 900, margin: 0 }}>
                  $ {plan.precio.toLocaleString("es-AR")}
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>por mes</p>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <div style={{ textAlign: "center", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 8px" }}>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: plan.color }}>{plan.videos_activos}</p>
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

            <div style={{ padding: "20px 24px" }}>
              {(plan.features || []).map((f: string, i: number) => (
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

            <div style={{ padding: "0 24px 24px" }}>
              <button
                onClick={() => handleContratar(plan.id, plan.precio, plan.nombre)}
                style={{
                  width: "100%", padding: "15px", borderRadius: 14, border: "none",
                  background: plan.color,
                  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                  opacity: planSeleccionado === plan.id ? 0.7 : 1,
                }}
              >
                {planSeleccionado === plan.id ? "Procesando..." : `Contratar ${plan.nombre}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
