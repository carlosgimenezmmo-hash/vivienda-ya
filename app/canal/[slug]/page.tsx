"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

const TABS = ["Todos", "Venta", "Alquiler", "Permuta", "Temporario"]

export default function CanalPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [canal, setCanal] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tabActiva, setTabActiva] = useState("Todos")
  const [propActiva, setPropActiva] = useState<any>(null)
  const [videoActivo, setVideoActivo] = useState<any>(null)

  useEffect(() => { fetchCanal() }, [slug])

  const fetchCanal = async () => {
    const { data: canalData } = await supabase.from("channels").select("*").eq("slug", slug).single()
    if (!canalData) { setLoading(false); return }
    setCanal(canalData)
    const { data: props } = await supabase.from("properties").select("*").eq("user_id", canalData.user_id).eq("status", "approved").order("created_at", { ascending: false })
    setProperties(props || [])
    setLoading(false)
  }

  const propsFiltradas = tabActiva === "Todos" ? properties : properties.filter(p => p.operation_type?.toLowerCase() === tabActiva.toLowerCase())

  if (loading) return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Cargando canal...</p>
    </div>
  )

  if (!canal) return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <p style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Canal no encontrado</p>
      <button onClick={() => router.push("/")} style={{ marginTop: 16, background: "#2563EB", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 15, cursor: "pointer" }}>Volver al inicio</button>
    </div>
  )

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", overflowY: "scroll" } as React.CSSProperties}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 0", display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
      </div>

      {/* PERFIL */}
      <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: canal.logo_url ? "transparent" : canal.color_primario, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", overflow: "hidden", flexShrink: 0 }}>
            {canal.logo_url ? <img src={canal.logo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : canal.nombre[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{canal.nombre}</h1>
              {canal.verificado && <span style={{ background: canal.color_primario, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>Verificado</span>}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{properties.length} propiedades</p>
          </div>
        </div>
        {canal.descripcion && <p style={{ margin: "0 0 8px", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{canal.descripcion}</p>}
        {canal.link_externo && <a href={canal.link_externo} target="_blank" rel="noopener noreferrer" style={{ color: canal.color_primario, fontSize: 13, fontWeight: 600 }}>{canal.link_externo}</a>}
      </div>

      {/* TABS */}
      <div style={{ padding: "0 20px 16px", display: "flex", gap: 8, overflowX: "auto" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setTabActiva(tab)} style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: tabActiva === tab ? "#2563EB" : "rgba(255,255,255,0.08)", color: tabActiva === tab ? "#fff" : "rgba(255,255,255,0.5)", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* GRID */}
      {propsFiltradas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>No hay propiedades en esta categoria</p>
        </div>
      ) : (
        <div style={{ padding: "0 20px 160px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {propsFiltradas.map((p) => (
            <div key={p.id} onClick={() => setPropActiva(p)} style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", position: "relative", aspectRatio: "9/16" as any, background: "#111" }}>
              {p.video_url && <video src={p.video_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "24px 8px 8px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 800, color: "#fff" }}>{p.title || p.operation_type?.toUpperCase()}</p>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>USD {Number(p.price)?.toLocaleString()}</p>
              </div>
              <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", borderRadius: 20, padding: "2px 8px" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{p.operation_type?.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PANEL DETALLE */}
      {propActiva && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end" }} onClick={() => setPropActiva(null)}>
          <div style={{ background: "#1a1a1a", borderRadius: "24px 24px 0 0", padding: "20px 20px 48px", width: "100%", maxWidth: 500, margin: "0 auto", maxHeight: "80vh", overflowY: "scroll" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "0 auto 20px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#fff" }}>{propActiva.title || "Sin titulo"}</h2>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{[propActiva.neighborhood, propActiva.city].filter(Boolean).join(", ")}</p>
              </div>
              <button onClick={() => setPropActiva(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>x</button>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 800, color: "#fff" }}>USD {Number(propActiva.price)?.toLocaleString()}</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" as const }}>
              {propActiva.rooms && <span style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 13 }}>{propActiva.rooms} amb.</span>}
              {propActiva.bedrooms && <span style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 13 }}>{propActiva.bedrooms} dorm.</span>}
              {propActiva.surface && <span style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 13 }}>{propActiva.surface} m2</span>}
            </div>
            {propActiva.description && <p style={{ margin: "0 0 16px", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{propActiva.description}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setVideoActivo(propActiva); setPropActiva(null) }} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "#2563EB", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                Ver video
              </button>
              <button onClick={() => { const clean = propActiva.whatsapp_number?.replace(/\D/g, ""); const msg = "Hola! Vi tu propiedad en ViviendaYa y me interesa."; window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank") }} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PANTALLA COMPLETA */}
      {videoActivo && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 100, display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "52px 16px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(rgba(0,0,0,0.6), transparent)" }}>
            <button onClick={() => setVideoActivo(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{canal.nombre}</span>
            <div style={{ width: 38 }} />
          </div>
          <video src={videoActivo.video_url} autoPlay controls playsInline style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 40px", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", zIndex: 10 }}>
            <p style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#fff" }}>{videoActivo.title || "Sin titulo"}</p>
            <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#fff" }}>USD {Number(videoActivo.price)?.toLocaleString()}</p>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{[videoActivo.neighborhood, videoActivo.city].filter(Boolean).join(", ")}</p>
          </div>
        </div>
      )}

    </div>
  )
}
