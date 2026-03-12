"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function PerfilPage() {
  const { user, isLoggedIn, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // ── PANTALLA SIN LOGIN ──────────────────────────────────────────────────────
  if (!isLoggedIn || !user) {
    return (
      <div style={{
        minHeight: "100dvh", background: "#0a0a0a", color: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "0 24px",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(37,99,235,0.12)", border: "2px solid rgba(37,99,235,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>
          Tu perfil te espera
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", margin: "0 0 36px", lineHeight: 1.6 }}>
          Creá tu cuenta para gestionar tus propiedades,<br/>créditos y contactar propietarios.
        </p>
        <button onClick={() => router.push("/registro")} style={{
          width: "100%", maxWidth: 340, padding: "16px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
          color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 12,
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
        }}>
          Registrarme gratis →
        </button>
        <button onClick={() => router.push("/login")} style={{
          width: "100%", maxWidth: 340, padding: "15px", borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.05)",
          color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600,
          cursor: "pointer",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          Ya tengo cuenta
        </button>
      </div>
    )
  }

  // ── PANTALLA CON LOGIN ──────────────────────────────────────────────────────
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  const menuItems = [
    { emoji: "🏠", label: "Mis Publicaciones", sub: "0 propiedades activas", href: "/publicar" },
    { emoji: "🔖", label: "Guardados", sub: "Propiedades que te gustaron", href: "#" },
    { emoji: "🔁", label: "Mis Permutas", sub: "Intercambios activos", href: "#" },
    { emoji: "💬", label: "Mensajes", sub: "Conversaciones con propietarios", href: "#" },
    { emoji: "⚙️", label: "Configuración", sub: "Cuenta y privacidad", href: "/configuracion" },/ ]
  

  return (
    <div style={{
      minHeight: "100dvh", background: "#0a0a0a", color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: 90,
    }}>

      {/* HEADER */}
      <div style={{
        padding: "52px 20px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Mi Perfil</h1>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 20, padding: "6px 14px", color: "#FCA5A5",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          Salir
        </button>
      </div>

      {/* AVATAR + DATOS */}
      <div style={{ padding: "24px 20px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, fontWeight: 800, color: "#fff", flexShrink: 0,
          border: "3px solid rgba(37,99,235,0.4)",
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{user.name}</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 8px" }}>{user.email}</p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 20, padding: "3px 10px",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ color: "#22C55E", fontSize: 12, fontWeight: 600 }}>Verificado</span>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { label: "Publicaciones", value: "0" },
          { label: "Guardados", value: "0" },
          { label: "Créditos", value: String(user.credits || 0) },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "14px 10px", textAlign: "center",
          }}>
            <p style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{stat.value}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* CRÉDITOS BANNER */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 16, padding: "14px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🪙</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Mis Créditos</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Usá créditos para destacar propiedades</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#F59E0B" }}>{user.credits || 0}</p>
          </div>
        </div>
      </div>

      {/* MENÚ */}
      <div style={{ padding: "0 20px" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, overflow: "hidden",
        }}>
          {menuItems.map((item, i) => (
            <div
              key={item.label}
              onClick={() => item.href !== "#" && router.push(item.href)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                borderBottom: i < menuItems.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                cursor: item.href !== "#" ? "pointer" : "default",
              }}
            >
              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{item.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* PLAN ACTUAL */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{
          background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)",
          borderRadius: 16, padding: "14px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#60A5FA" }}>Plan actual: GRATIS</p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>3 videos · 60 seg · Verificación ARRYSE</p>
          </div>
          <button style={{
            background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
            border: "none", borderRadius: 10, padding: "8px 14px",
            color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}>
            PRO →
          </button>
        </div>
      </div>

      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => setShowLogoutConfirm(false)}>
          <div style={{
            width: "100%", maxWidth: 430,
            background: "#1a1a1a", borderRadius: "20px 20px 0 0",
            padding: "24px 20px 40px",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", textAlign: "center" }}>¿Cerrar sesión?</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", margin: "0 0 24px" }}>
              Podés volver a entrar cuando quieras.
            </p>
            <button onClick={handleLogout} style={{
              width: "100%", padding: "15px", borderRadius: 14,
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5", fontSize: 15, fontWeight: 700, cursor: "pointer",
              marginBottom: 10, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}>
              Sí, cerrar sesión
            </button>
            <button onClick={() => setShowLogoutConfirm(false)} style={{
              width: "100%", padding: "15px", borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
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
