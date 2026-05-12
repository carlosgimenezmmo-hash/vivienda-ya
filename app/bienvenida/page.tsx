"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

const PROVINCIAS = [
  "Buenos Aires","CABA","Córdoba","Santa Fe","Mendoza","Tucumán","Salta",
  "Entre Ríos","Misiones","Chaco","Corrientes","Santiago del Estero","San Juan",
  "Jujuy","Río Negro","Neuquén","Formosa","Chubut","San Luis","Catamarca",
  "La Rioja","La Pampa","Santa Cruz","Tierra del Fuego"
]

export default function BienvenidaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [telefono, setTelefono] = useState("")
  const [provincia, setProvincia] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/registro"); return }
      const fullName = user.user_metadata?.full_name || ""
      const parts = fullName.split(" ")
      setNombre(parts[0] || "")
      setApellido(parts.slice(1).join(" ") || "")
      setAvatarUrl(user.user_metadata?.avatar_url || "")
    }
    getUser()
  }, [])

  const handleGuardar = async () => {
    setError("")
    if (!nombre.trim()) return setError("Ingresá tu nombre")
    if (!apellido.trim()) return setError("Ingresá tu apellido")
    if (!telefono.trim()) return setError("Ingresá tu teléfono")
    if (!provincia) return setError("Seleccioná tu provincia")
    if (!ciudad.trim()) return setError("Ingresá tu ciudad")

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sesión expirada")

      const fullName = `${nombre.trim()} ${apellido.trim()}`

      await supabase.from("users").update({
        full_name: fullName,
        phone: telefono.trim(),
        province: provincia,
        city: ciudad.trim(),
      }).eq("id", user.id)

      await supabase.from("channels").update({
        nombre: fullName,
      }).eq("user_id", user.id)

      router.push("/feed")
    } catch (err: any) {
      setError(err.message || "Error al guardar")
    } finally {
      setLoading(false)
    }
  }

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
    marginTop: 8,
  }

  return (
    <div style={{
      minHeight: "100dvh", background: "#0a0a0a", color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      padding: "52px 24px 48px", overflowY: "auto",
    }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>

        {avatarUrl && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <img src={avatarUrl} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(34,197,94,0.5)" }} />
          </div>
        )}

        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px", textAlign: "center" }}>
          Bienvenido a Vivienda<span style={{ color: "#22C55E" }}>Ya</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 32px", textAlign: "center" }}>
          Completá tus datos para continuar
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 6px", fontWeight: 600 }}>Nombre</p>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" style={inp} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 6px", fontWeight: 600 }}>Apellido</p>
              <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Tu apellido" style={inp} />
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 6px", fontWeight: 600 }}>Teléfono</p>
            <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 5491112345678" type="tel" style={inp} />
          </div>

          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 6px", fontWeight: 600 }}>Provincia</p>
            <select value={provincia} onChange={e => setProvincia(e.target.value)} style={{ ...inp, appearance: "none" as any }}>
              <option value="">Seleccioná tu provincia</option>
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {provincia && (
            <div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 6px", fontWeight: 600 }}>Ciudad</p>
              <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Tu ciudad" style={inp} />
            </div>
          )}
        </div>

        {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 12 }}>{error}</p>}

        <button onClick={handleGuardar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Guardando..." : "Ir al feed"}
        </button>

        <p onClick={() => router.push("/feed")} style={{
          textAlign: "center", marginTop: 16, color: "rgba(255,255,255,0.3)",
          fontSize: 13, cursor: "pointer",
        }}>
          Completar después
        </p>
      </div>
    </div>
  )
}