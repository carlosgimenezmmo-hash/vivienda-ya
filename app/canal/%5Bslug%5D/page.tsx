"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function CanalPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [canal, setCanal] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCanal()
  }, [slug])

  const fetchCanal = async () => {
    const { data: canalData } = await supabase
      .from("channels")
      .select("*")
      .eq("slug", slug)
      .single()

    if (!canalData) { setLoading(false); return }
    setCanal(canalData)

    const { data: props } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", canalData.user_id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    setProperties(props || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Cargando canal...</p>
      </div>
    )
  }

  if (!canal) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <p style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Canal no encontrado</p>
        <button onClick={() => router.push("/")} style={{ marginTop: 16, background: "#2563EB", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 15, cursor: "pointer" }}>Volver al inicio</button>
      </div>
    )
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", overflowY: "scroll" } as React.CSSProperties}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 0", display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
      </div>

      {/* PERFIL DEL CANAL */}
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: canal.logo_url ? "transparent" : canal.color_primario, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", overflow: "hidden", flexShrink: 0 }}>
            {canal.logo_url ? <img src={canal.logo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : canal.nombre[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{canal.nombre}</h1>
              {canal.verificado && (
                <span style={{ background: canal.color_primario, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                  Verificado
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{properties.length} propiedades</p>
          </div>
        </div>
        {canal.descripcion && (
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{canal.descripcion}</p>
        )}
        {canal.link_externo && (
          <a href={canal.link_externo} target="_blank" rel="noopener noreferrer" style={{ color: canal.color_primario, fontSize: 13, fontWeight: 600 }}>{canal.link_externo}</a>
        )}
      </div>

      {/* PROPIEDADES */}
      <div style={{ padding: "20px 20px 160px" }}>
        {properties.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>Este canal no tiene propiedades publicadas</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {properties.map((p) => (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                {p.video_url && <video src={p.video_url} style={{ width: "100%", height: 200, objectFit: "cover" }} muted playsInline />}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                      {p.operation_type?.toUpperCase()}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{p.title || "Sin titulo"}</h3>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{[p.neighborhood, p.city].filter(Boolean).join(", ")}</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>USD {Number(p.price)?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}