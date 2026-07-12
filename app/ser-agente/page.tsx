"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

const pagarMP = async (titulo: string, precio: number, planId: string) => {
const session = (await supabase.auth.getSession()).data.session
    const res = await fetch("/api/pago", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "authorization": `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        titulo,
        precio,
        planId,
        userId: session?.user?.id,
      }),
    })
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else alert("Error al procesar el pago.")
}

export default function SerAgentePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [paso, setPaso] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre_completo: "",
    dni: "",
    cuil: "",
    cbu: "",
    alias_cbu: "",
    banco: "",
    condicion_afip: "monotributista",
    codigo_referido: "",
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const guardarDatos = async () => {
    setLoading(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    if (!uid) return

    await supabase.from("agentes").upsert({
      user_id: uid,
      nombre_completo: form.nombre_completo,
      dni: form.dni,
      cuil: form.cuil,
      cbu: form.cbu,
      alias_cbu: form.alias_cbu,
      banco: form.banco,
      condicion_afip: form.condicion_afip,
    })

    if (form.codigo_referido) {
      const { data: referidor } = await supabase
        .from("agentes")
        .select("user_id")
        .eq("codigo_referido", form.codigo_referido.toLowerCase())
        .maybeSingle()
      if (referidor) {
        await supabase
          .from("users")
          .update({ referido_por: referidor.user_id })
          .eq("id", uid)
      }
    }

    setLoading(false)
    setPaso(3)
  }

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
    color: "#fff", fontSize: 15, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    boxSizing: "border-box" as const, outline: "none",
  }

  const labelStyle = {
    fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block",
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 100 }}>

      <div style={{ padding: "52px 24px 24px", maxWidth: 500, margin: "0 auto" }}>
        <button onClick={() => paso === 1 ? router.back() : setPaso(paso - 1)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>

        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= paso ? "#A855F7" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>

        {paso === 1 && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>Convertite en agente</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: "0 0 32px" }}>Publicá propiedades, reclutá agentes y ganá comisiones de por vida.</p>

            {[
              { emoji: "🏠", titulo: "Publicá propiedades y hoteles", sub: "Subí videos y generá reservas" },
              { emoji: "👥", titulo: "Reclutá tu red", sub: "Cada agente que sumes trabaja para vos" },
              { emoji: "💰", titulo: "Comisiones de por vida", sub: "Cobrás de cada reserva de tu red" },
              { emoji: "🏆", titulo: "Premios y reconocimientos", sub: "Rankings, viajes y badges exclusivos" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px" }}>
                <span style={{ fontSize: 28 }}>{b.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{b.titulo}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{b.sub}</p>
                </div>
              </div>
            ))}

            <button onClick={() => setPaso(2)} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #A855F7, #F59E0B)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", marginTop: 8 }}>
              Quiero ser agente
            </button>
          </div>
        )}

        {paso === 2 && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>Tus datos</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: "0 0 32px" }}>Los necesitamos para transferirte tus comisiones.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} placeholder="Como figura en el DNI" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>DNI</label>
                <input name="dni" value={form.dni} onChange={handleChange} placeholder="12345678" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CUIL</label>
                <input name="cuil" value={form.cuil} onChange={handleChange} placeholder="20-12345678-9" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CBU</label>
                <input name="cbu" value={form.cbu} onChange={handleChange} placeholder="22 dígitos" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Alias CBU</label>
                <input name="alias_cbu" value={form.alias_cbu} onChange={handleChange} placeholder="mi.alias.banco" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Banco</label>
                <input name="banco" value={form.banco} onChange={handleChange} placeholder="Ej: Galicia, Santander, Naranja X" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Condición AFIP</label>
                <select name="condicion_afip" value={form.condicion_afip} onChange={handleChange} style={{ ...inputStyle }}>
                  <option value="monotributista">Monotributista</option>
                  <option value="responsable_inscripto">Responsable Inscripto</option>
                  <option value="relacion_dependencia">Relación de Dependencia</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Código de referido (opcional)</label>
                <input name="codigo_referido" value={form.codigo_referido} onChange={handleChange} placeholder="Si alguien te invitó" style={inputStyle} />
              </div>
            </div>

            <button
              onClick={guardarDatos}
              disabled={loading || !form.nombre_completo || !form.dni || !form.cuil || !form.cbu}
              style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#A855F7", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", marginTop: 24, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Guardando..." : "Continuar"}
            </button>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>Elegí tu plan</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: "0 0 32px" }}>Activá tu cuenta de agente y empezá a ganar.</p>

            {[
              { id: "junior", nombre: "Junior", precio: 25000, color: "#94A3B8", features: ["10 videos activos", "1 destacado/mes", "Acceso a la red"] },
              { id: "agente", nombre: "Agente", precio: 50000, color: "#F59E0B", features: ["25 videos activos", "3 destacados/mes", "Dashboard de red"] },
              { id: "especializado", nombre: "Especializado", precio: 80000, color: "#2563EB", features: ["60 videos activos", "5 destacados/mes", "Soporte WhatsApp"] },
              { id: "senior", nombre: "Senior", precio: 150000, color: "#A855F7", features: ["120 videos activos", "10 destacados/mes", "Todo incluido"] },
            ].map(plan => (
              <div key={plan.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${plan.color}44`, borderRadius: 16, padding: "20px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ background: plan.color, borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 800, color: "#fff" }}>{plan.nombre}</span>
                  <span style={{ fontSize: 22, fontWeight: 900 }}>${plan.precio.toLocaleString("es-AR")}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>/mes</span></span>
                </div>
                {plan.features.map((f, i) => (
                  <p key={i} style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>✓ {f}</p>
                ))}
                <button
                  onClick={() => pagarMP(`Plan ${plan.nombre} - ViviendaYa`, plan.precio, plan.id)}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: plan.color, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", marginTop: 12 }}
                >
                  Contratar {plan.nombre}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
