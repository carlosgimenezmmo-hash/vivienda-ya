"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

export default function MiCanalPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [canal, setCanal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [nombre, setNombre] = useState("")
  const [slug, setSlug] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [linkExterno, setLinkExterno] = useState("")
  const [error, setError] = useState("")
  const [exito, setExito] = useState("")

  useEffect(() => {
    if (!isLoggedIn) return
    fetchCanal()
  }, [isLoggedIn])

  const fetchCanal = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) { setLoading(false); return }
    const { data } = await supabase.from("channels").select("*").eq("user_id", uid).single()
    if (data) {
      setCanal(data)
      setNombre(data.nombre)
      setSlug(data.slug)
      setDescripcion(data.descripcion || "")
      setLinkExterno(data.link_externo || "")
    }
    setLoading(false)
  }

  const generarSlug = (texto: string) => {
    return texto.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 50)
  }

  const handleGuardar = async () => {
    if (!nombre || !slug) { setError("El nombre y el slug son obligatorios"); return }
    setGuardando(true)
    setError("")
    setExito("")
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) { setGuardando(false); return }

    const payload = { user_id: uid, nombre, slug, descripcion, link_externo: linkExterno }

    if (canal) {
      const { error } = await supabase.from("channels").update(payload).eq("user_id", uid)
      if (error) { setError(error.message); setGuardando(false); return }
    } else {
      const { error } = await supabase.from("channels").insert(payload)
      if (error) { setError(error.message.includes("unique") ? "Ese slug ya esta en uso, elegi otro" : error.message); setGuardando(false); return }
    }

    setExito("Canal guardado correctamente")
    setGuardando(false)
    fetchCanal()
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  }

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <p style={{ fontSize: 18, marginBottom: 16 }}>Necesitas una cuenta</p>
        <button onClick={() => router.push("/registro")} style={{ background: "#2563EB", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 15, cursor: "pointer" }}>Registrarme</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Cargando...</p>
      </div>
    )
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", overflowY: "scroll" } as React.CSSProperties}>

      <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Mi Canal</h1>
      </div>

      <div style={{ padding: "0 20px 160px" }}>

        {canal && (
          <div style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 14, padding: "14px 16px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Tu canal esta activo</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>vivienda-ya.vercel.app/canal/{canal.slug}</p>
            </div>
            <button onClick={() => router.push(`/canal/${canal.slug}`)} style={{ background: "#2563EB", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
              Ver canal
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Nombre del canal</p>
            <input value={nombre} onChange={e => { setNombre(e.target.value); if (!canal) setSlug(generarSlug(e.target.value)) }} placeholder="Ej: Inmobiliaria Lopez" style={inp} />
          </div>

          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>URL del canal</p>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden" }}>
              <span style={{ padding: "14px 12px", color: "rgba(255,255,255,0.3)", fontSize: 13, whiteSpace: "nowrap" }}>canal/</span>
              <input value={slug} onChange={e => setSlug(generarSlug(e.target.value))} placeholder="mi-canal" style={{ ...inp, border: "none", background: "transparent", borderRadius: 0 }} />
            </div>
          </div>

          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Descripcion</p>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Contanos sobre tu canal..." maxLength={200} style={{ ...inp, height: 80, resize: "none" }} />
          </div>

          <div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Link externo (opcional)</p>
            <input value={linkExterno} onChange={e => setLinkExterno(e.target.value)} placeholder="https://tu-sitio.com" style={inp} />
          </div>

          {error && <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>}
          {exito && <p style={{ color: "#22C55E", fontSize: 13, margin: 0 }}>{exito}</p>}

          <button onClick={handleGuardar} disabled={guardando} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #2563EB, #1d4ed8)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", opacity: guardando ? 0.6 : 1, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
            {guardando ? "Guardando..." : canal ? "Actualizar canal" : "Crear canal"}
          </button>

          {!canal && (
            <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#F59E0B" }}>Para activar tu canal necesitas el plan STARTER o superior.</p>
              <button onClick={() => router.push("/planes")} style={{ background: "none", border: "none", color: "#F59E0B", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginTop: 6, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                Ver planes →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}