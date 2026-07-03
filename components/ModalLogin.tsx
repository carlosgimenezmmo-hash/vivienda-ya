"use client"
import { usePathname, useRouter } from "next/navigation"

export default function ModalLogin() {
  const router = useRouter()
  const pathname = usePathname()
  const returnTo = encodeURIComponent(pathname)

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 10px", textAlign: "center" }}>Creá tu cuenta gratis</h2>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 28px", textAlign: "center", lineHeight: 1.5 }}>Es gratis y rápido.</p>
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {[
          { emoji: "❤️", texto: "Guardá y likeá propiedades" },
          { emoji: "💬", texto: "Chateá con propietarios" },
          { emoji: "🏠", texto: "Publicá tus propiedades" },
          { emoji: "📞", texto: "Contactá por WhatsApp" },
        ].map(b => (
          <div key={b.texto} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{b.emoji}</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{b.texto}</span>
          </div>
        ))}
      </div>
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => router.push(`/registro?returnTo=${returnTo}`)} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #2563EB, #1d4ed8)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
          Registrarme
        </button>
        <button onClick={() => router.push(`/registro?returnTo=${returnTo}`)} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
          Ya tengo cuenta
        </button>
      </div>
    </div>
  )
}