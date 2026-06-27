"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

function sanitizeText(value: string, maxLength = 100): string {
  return value.replace(/<[^>]*>/g, "").replace(/[<>'"]/g, "").trim().slice(0, maxLength)
}

function sanitizePhone(value: string): string {
  return value.replace(/[^0-9+]/g, "").slice(0, 20)
}

export default function CompletarPerfilPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [edad, setEdad] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGuardar = async () => {
    setError("")
    const nombreClean = sanitizeText(nombre, 100)
    const whatsappClean = sanitizePhone(whatsapp)
    const edadNum = parseInt(edad)

    if (!nombreClean) { setError("Ingresá tu nombre y apellido"); return }
    if (!edadNum || edadNum < 18) { setError("Tenés que ser mayor de 18 años para usar ViviendaYa"); return }
    if (edadNum > 110) { setError("Ingresá una edad válida"); return }
    if (!whatsappClean || whatsappClean.length < 8) { setError("Ingresá un número de WhatsApp válido"); return }

    setLoading(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) { setError("Sesión expirada. Volvé a iniciar sesión."); setLoading(false); return }

    const { error: updateError } = await supabase
      .from("users")
      .update({ full_name: nombreClean, age: edadNum, whatsapp: whatsappClean })
      .eq("id", uid)

    if (updateError) { setError(updateError.message); setLoading(false); return }

    router.push("/feed")
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <p style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", textAlign: "center" }}>Completá tu perfil</p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 32px", textAlign: "center" }}>Necesitamos estos datos para que puedas usar ViviendaYa</p>

      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Nombre y apellido</p>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" maxLength={100} style={inp} />
        </div>

        <div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Edad</p>
          <input value={edad} onChange={e => setEdad(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Ej: 28" type="number" inputMode="numeric" maxLength={3} style={inp} />
        </div>

        <div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>WhatsApp</p>
          <input value={whatsapp} onChange={e => setWhatsapp(sanitizePhone(e.target.value))} placeholder="Ej: 5492983123456" type="tel" maxLength={20} style={inp} />
        </div>

        {error && <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>}

        <button onClick={handleGuardar} disabled={loading} style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
          color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
          opacity: loading ? 0.6 : 1,
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          {loading ? "Guardando..." : "Continuar"}
        </button>
      </div>
    </div>
  )
}