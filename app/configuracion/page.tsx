"use client"
import ModalLogin from "@/components/ModalLogin"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

export default function ConfiguracionPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [preference, setPreference] = useState("whatsapp")
  const [notifEmail, setNotifEmail] = useState("")
  const [notifWhatsapp, setNotifWhatsapp] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  }

  const btn: React.CSSProperties = {
    width: "100%", padding: "16px", borderRadius: 14, border: "none",
    background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
    color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  }

  const chip = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "14px", borderRadius: 12, cursor: "pointer",
    border: `2px solid ${active ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
    background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
    color: active ? "#60A5FA" : "rgba(255,255,255,0.5)",
    fontSize: 14, fontWeight: active ? 700 : 500,
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    textAlign: "center" as const,
  })

  useEffect(() => {
    if (isLoggedIn) fetchConfig()
  }, [isLoggedIn])

  const fetchConfig = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) return

    const { data } = await supabase.from("users")
      .select("notification_preference, notification_email, notification_whatsapp")
      .eq("id", uid)
      .single()

    if (data) {
      setPreference(data.notification_preference || "whatsapp")
      setNotifEmail(data.notification_email || "")
      setNotifWhatsapp(data.notification_whatsapp || "")
    }
  }

  const handleGuardar = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) return

    const { error: updateError } = await supabase.from("users").update({
      notification_preference: preference,
      notification_email: notifEmail || null,
      notification_whatsapp: notifWhatsapp || null,
    }).eq("id", uid)

    setLoading(false)
    if (updateError) return setError(updateError.message)
    setSuccess("Configuracion guardada correctamente")
  }
if (!isLoggedIn) return <ModalLogin />

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Configuracion</h1>
      </div>

      <div style={{ padding: "0 20px" }}>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 16px", fontWeight: 600 }}>NOTIFICACIONES DE RESERVAS</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>¿Cómo querés que te avisemos cuando llegue una reserva?</p>

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button onClick={() => setPreference("whatsapp")} style={chip(preference === "whatsapp")}>
            📱 WhatsApp
          </button>
          <button onClick={() => setPreference("email")} style={chip(preference === "email")}>
            📧 Email
          </button>
          <button onClick={() => setPreference("ambos")} style={chip(preference === "ambos")}>
            🔔 Ambos
          </button>
        </div>

        {(preference === "whatsapp" || preference === "ambos") && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>WhatsApp para notificaciones</p>
            <input
              value={notifWhatsapp}
              onChange={e => setNotifWhatsapp(e.target.value.replace(/[^0-9+]/g, ""))}
              placeholder="Ej: 5491112345678"
              type="tel"
              style={inp}
            />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "6px 0 0" }}>Con código de país. Ej: 549 para Argentina</p>
          </div>
        )}

        {(preference === "email" || preference === "ambos") && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Email para notificaciones</p>
            <input
              value={notifEmail}
              onChange={e => setNotifEmail(e.target.value)}
              placeholder="Ej: reservas@mihotel.com"
              type="email"
              style={inp}
            />
          </div>
        )}

        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p></div>}
        {success && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><p style={{ color: "#22C55E", fontSize: 13, margin: 0 }}>{success}</p></div>}

        <button onClick={handleGuardar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Guardando..." : "Guardar configuracion"}
        </button>

      </div>
    </div>
  )
}