"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

const PLAN_COLORS: Record<string, string> = {
  gratis: "#888",
  plata: "#94A3B8",
  oro: "#F59E0B",
  platino: "#2563EB",
  diamante: "#A855F7",
}

const PLAN_NOMBRES: Record<string, string> = {
  gratis: "Gratis",
  plata: "Plata",
  oro: "Oro",
  platino: "Platino",
  diamante: "Diamante",
}

export default function PerfilPage() {
  const { user, isLoggedIn, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [planActual, setPlanActual] = useState<string>("gratis")
  const [stats, setStats] = useState({ publicaciones: 0, guardados: 0 })
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) return
    const cargarDatos = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id || user.id
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan, estado")
        .eq("user_id", uid)
        .eq("estado", "activo")
        .single()
      if (sub?.plan) setPlanActual(sub.plan)
      const { count: pubs } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
      setStats({ publicaciones: pubs || 0, guardados: 0 })
    }
    cargarDatos()
  }, [user?.id])

  if (!isLoggedIn || !user) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>Tu perfil te espera</h2>
        <button onClick={() => router.push("/registro")} style={{ width: "100%", maxWidth: 340, padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #2563EB, #1d4ed8)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Registrarme gratis</button>
        <button onClick={() => router.push("/login")} style={{ width: "100%", maxWidth: 340, padding: "15px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Ya tengo cuenta</button>
      </div>
    )
  }

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  const planColor = PLAN_COLORS[planActual] || "#888"
  const planNombre = PLAN_NOMBRES[planActual] || "Gratis"

  const menuItems = [
    { emoji: "📊", label: "Estadisticas", sub: "Metricas y analiticas de tus videos", href: "/dashboard" },
    { emoji: "📋", label: "Mis Publicaciones", sub: "Gestioná tus videos activos", href: "/mis-publicaciones" },
    { emoji: "🔖", label: "Guardados", sub: "Propiedades que te gustaron", href: "/guardados" },
    { emoji: "📺", label: "Mi Canal", sub: "Gestiona tu canal", href: "/mi-canal" },
    { emoji: "💎", label: "Mis Planes", sub: "Ver y cambiar tu plan actual", href: "/planes" },
    { emoji: "⚙️", label: "Configuracion", sub: "Cuenta y privacidad", href: "/configuracion" },
  ]
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", overflowY: "scroll" }}>

      <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Mi Perfil</h1>
        <button onClick={() => setShowLogoutConfirm(true)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: "6px 14px", color: "#FCA5A5", fontSize: 13, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Salir</button>
      </div>

      <div style={{ padding: "0 20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: user.avatar_url ? "transparent" : "linear-gradient(135deg, #2563EB, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff", border: "3px solid rgba(37,99,235,0.4)", overflow: "hidden" }}>
            {user.avatar_url ? <img src={user.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
          </div>
          <label htmlFor="avatar-upload" style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#2563EB", border: "2px solid #0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </label>
          <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const { data: sessionData } = await supabase.auth.getSession()
            const uid = sessionData?.session?.user?.id || user?.id
            if (!uid) return
            const ext = file.name.split(".").pop()
            const path = "avatars/" + uid + "." + ext
            const { error } = await supabase.storage.from("videos-app").upload(path, file, { upsert: true, contentType: file.type })
            if (error) { alert("Error: " + error.message); return }
            const { data } = supabase.storage.from("videos-app").getPublicUrl(path)
            await supabase.from("users").update({ avatar_url: data.publicUrl }).eq("id", uid)
            await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } })
            window.location.reload()
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{user.name}</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 8px" }}>{user.email}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${planColor}22`, border: `1px solid ${planColor}55`, borderRadius: 20, padding: "3px 10px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: planColor }} />
            <span style={{ color: planColor, fontSize: 12, fontWeight: 700 }}>Plan {planNombre}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {[
          { label: "Publicaciones", value: String(stats.publicaciones) },
          { label: "Guardados", value: String(stats.guardados) },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{s.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 20px" }}>
        {planActual === "gratis" ? (
          <div onClick={() => router.push("/planes")} style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))", border: "1px solid rgba(37,99,235,0.4)", borderRadius: 16, padding: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#fff" }}>Mejora tu plan</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Plata desde $11.200/mes</p>
            </div>
            <div style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", borderRadius: 20, padding: "8px 16px" }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Ver planes</span>
            </div>
          </div>
        ) : (
          <div onClick={() => router.push("/planes")} style={{ background: `${planColor}15`, border: `1px solid ${planColor}40`, borderRadius: 16, padding: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#fff" }}>Plan {planNombre} activo</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Toca para ver detalles</p>
            </div>
            <div style={{ background: planColor, borderRadius: 20, padding: "8px 16px" }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{planNombre} ✓</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "0 20px 100px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
          {menuItems.map((item, i) => (
            <div key={item.label} onClick={() => router.push(item.href)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderBottom: i < menuItems.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", cursor: "pointer" }}>
              <span style={{ fontSize: 22, width: 36, textAlign: "center" }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          ))}
        </div>
      </div>

      {showLogoutConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }} onClick={() => setShowLogoutConfirm(false)}>
          <div style={{ background: "#1a1a1a", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 430 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", textAlign: "center" }}>Cerrar sesion?</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", margin: "0 0 24px" }}>Podes volver a entrar cuando quieras.</p>
            <button onClick={async () => { await logout(); router.push("/"); }} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#EF4444", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Si, cerrar sesion</button>
            <button onClick={() => setShowLogoutConfirm(false)} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 15, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>Cancelar</button>
          </div>
        </div>
      )}

    </div>
  )
}
