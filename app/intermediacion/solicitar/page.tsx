"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function MisOperacionesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [operaciones, setOperaciones] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/registro"); return }

      const { data: ops } = await supabase
        .from("operaciones")
        .select(`
          *,
          martillero:martillero_id(full_name, phone),
          property:property_id(title, city, province)
        `)
        .eq("agente_id", user.id)
        .order("created_at", { ascending: false })

      if (ops) setOperaciones(ops)
      setLoading(false)
    }
    init()
  }, [])

  const estadoColor: Record<string, string> = {
    pendiente: "#F59E0B",
    en_proceso: "#3B82F6",
    cerrada: "#22C55E",
    cancelada: "#EF4444",
  }

  if (loading) return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", padding: "24px 16px 80px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", padding: "0 0 20px", fontFamily: "sans-serif" }}>
          ← Volver
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>
          Mis <span style={{ color: "#22C55E" }}>Operaciones</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 24px" }}>Seguimiento de intermediaciones</p>

        {operaciones.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 32, textAlign: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, margin: "0 0 16px" }}>No tenés operaciones aún</p>
            <button onClick={() => router.push("/feed")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Ver propiedades
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {operaciones.map(op => (
              <div key={op.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: estadoColor[op.estado] || "#fff", background: `${estadoColor[op.estado]}20`, padding: "3px 10px", borderRadius: 20 }}>
                    {op.estado.replace("_", " ").toUpperCase()}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    {new Date(op.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>

                <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>{op.property?.title || "Propiedad"}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 12px" }}>{op.property?.city}, {op.property?.province}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 2px" }}>Precio venta</p>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>USD {op.precio_venta?.toLocaleString("es-AR") || "-"}</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 2px" }}>Tu comisión</p>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#22C55E" }}>USD {op.comision_agente?.toLocaleString("es-AR") || "-"}</p>
                  </div>
                </div>

                {op.martillero && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "10px 0 0" }}>
                    Martillero: <span style={{ color: "#fff" }}>{op.martillero.full_name}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}