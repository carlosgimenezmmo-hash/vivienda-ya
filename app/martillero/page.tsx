"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function MartilleroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [operaciones, setOperaciones] = useState<any[]>([])
  const [stats, setStats] = useState({ pendientes: 0, en_proceso: 0, cerradas: 0, total_comisiones: 0 })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/registro"); return }

      const { data: userData } = await supabase
        .from("users")
        .select("rol, full_name")
        .eq("id", user.id)
        .single()

      if (userData?.rol !== "martillero") {
        router.push("/feed")
        return
      }

      const { data: ops } = await supabase
        .from("operaciones")
        .select(`
          *,
          agente:agente_id(full_name, email, phone),
          property:property_id(title, price, city, province)
        `)
        .eq("martillero_id", user.id)
        .order("created_at", { ascending: false })

      if (ops) {
        setOperaciones(ops)
        setStats({
          pendientes: ops.filter(o => o.estado === "pendiente").length,
          en_proceso: ops.filter(o => o.estado === "en_proceso").length,
          cerradas: ops.filter(o => o.estado === "cerrada").length,
          total_comisiones: ops
            .filter(o => o.estado === "cerrada")
            .reduce((sum, o) => sum + (o.comision_martillero || 0), 0),
        })
      }

      setLoading(false)
    }
    init()
  }, [])

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    await supabase.from("operaciones").update({ estado: nuevoEstado }).eq("id", id)
    setOperaciones(prev => prev.map(o => o.id === id ? { ...o, estado: nuevoEstado } : o))
  }

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
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>
          Panel <span style={{ color: "#22C55E" }}>Martillero</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 24px" }}>Gestión de operaciones de intermediación</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Pendientes", value: stats.pendientes, color: "#F59E0B" },
            { label: "En proceso", value: stats.en_proceso, color: "#3B82F6" },
            { label: "Cerradas", value: stats.cerradas, color: "#22C55E" },
            { label: "Comisiones", value: `$${stats.total_comisiones.toLocaleString("es-AR")}`, color: "#A855F7" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>{s.value}</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Operaciones */}
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: "rgba(255,255,255,0.7)" }}>Operaciones</h2>

        {operaciones.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 32, textAlign: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, margin: 0 }}>No hay operaciones asignadas aún</p>
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

                <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>
                  {op.property?.title || "Propiedad sin título"}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 8px" }}>
                  {op.property?.city}, {op.property?.province}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 2px" }}>Precio venta</p>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>${op.precio_venta?.toLocaleString("es-AR") || "-"}</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 2px" }}>Tu comisión</p>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#22C55E" }}>${op.comision_martillero?.toLocaleString("es-AR") || "-"}</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 2px" }}>Agente</p>
                    <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{op.agente?.full_name || "-"}</p>
                  </div>
                </div>

                {op.notas && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 12px", fontStyle: "italic" }}>"{op.notas}"</p>
                )}

                {op.estado === "pendiente" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => actualizarEstado(op.id, "en_proceso")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#3B82F6", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      Aceptar
                    </button>
                    <button onClick={() => actualizarEstado(op.id, "cancelada")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.4)", background: "transparent", color: "#EF4444", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      Rechazar
                    </button>
                  </div>
                )}

                {op.estado === "en_proceso" && (
                  <button onClick={() => actualizarEstado(op.id, "cerrada")} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Marcar como cerrada
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}