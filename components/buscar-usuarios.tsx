"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export function BuscarUsuarios({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [resultados, setResultados] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)

 const buscar = async (texto: string) => {
  setQuery(texto)
  if (texto.length < 2) { setResultados([]); return }
  setBuscando(true)

  const [{ data: canales }, { data: usuarios }] = await Promise.all([
    supabase.from("channels").select("slug, nombre, logo_url, color_primario, verificado, user_id").ilike("nombre", `%${texto}%`).limit(5),
    supabase.from("users").select("id, full_name, avatar_url").or(`full_name.ilike.%${texto}%,email.ilike.%${texto}%`)
  ])

  const resultadosCanales = (canales || []).map((c: any) => ({ ...c, tipo: "canal" }))
  const resultadosUsuarios = (usuarios || []).filter((u: any) => !resultadosCanales.find((c: any) => c.user_id === u.id)).map((u: any) => ({ nombre: u.full_name, logo_url: u.avatar_url, color_primario: "#2563EB", tipo: "usuario", slug: null }))

  setResultados([...resultadosCanales, ...resultadosUsuarios])
  setBuscando(false)
}
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ background: "#1a1a1a", borderRadius: "24px 24px 0 0", padding: "20px 20px 48px", maxHeight: "80vh", overflowY: "scroll" } as React.CSSProperties} onClick={e => e.stopPropagation()}>
        
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "0 auto 20px" }} />
        
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>Buscar usuarios</h2>
        <input
          autoFocus
          value={query}
          onChange={e => buscar(e.target.value)}
          placeholder="Nombre del usuario o canal..."
          style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", marginBottom: 16 }}
        />

        {buscando && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center" }}>Buscando...</p>}

        {!buscando && query.length >= 2 && resultados.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center" }}>No se encontraron usuarios</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {resultados.map((r) => (
            <div key={r.slug || r.nombre} onClick={() => { if (r.slug) { router.push(`/canal/${r.slug}`); onClose() } }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, cursor: r.slug ? "pointer" : "default" }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: r.logo_url ? "transparent" : r.color_primario, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", overflow: "hidden", flexShrink: 0 }}>
                {r.logo_url ? <img src={r.logo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : r.nombre[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#fff" }}>{r.nombre}</p>
                  {r.verificado && <span style={{ background: r.color_primario, borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>Verificado</span>}
                </div>
               <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{r.tipo === "canal" ? `canal/${r.slug}` : "Usuario registrado"}</p> 
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
