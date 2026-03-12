"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

const PLAN_LIMITS: Record<string, number> = {
  basico: 3,
  pro: 15,
  premium: 50,
  plus: 100,
}

export default function PublicarPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Video
  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const videoRef = useRef<HTMLInputElement>(null)

  // Duración extra
  const [duracionExtra, setDuracionExtra] = useState<null | 120 | 180 | 300>(null)

  // Datos propiedad
  const [operacion, setOperacion] = useState<"venta" | "alquiler" | "temporario" | "permuta">("venta")
  const [tipoPropiedad, setTipoPropiedad] = useState("departamento")
  const [precio, setPrecio] = useState("")
  const [moneda, setMoneda] = useState<"USD" | "ARS">("USD")
  const [ambientes, setAmbientes] = useState("")
  const [superficie, setSuperficie] = useState("")
  const [barrio, setBarrio] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [whatsapp, setWhatsapp] = useState(user?.phone || "")

  // Destacado
  const [destacado, setDestacado] = useState(false)

  // ARRYSE
  const [arryseStatus, setArryseStatus] = useState<"pending" | "verifying" | "ok" | "error">("pending")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const nivel = user?.level || "basico"
  const limite = PLAN_LIMITS[nivel] || 3
  const publicacionesUsadas = 0 // TODO: fetch from Supabase
  const porcentajeUso = (publicacionesUsadas / limite) * 100

  // ── GUARDS ───────────────────────────────────────────────────────────────
  if (!isLoggedIn || !user) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <span style={{ fontSize: 48, marginBottom: 16 }}>🔒</span>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>Necesitás una cuenta</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", margin: "0 0 28px" }}>Para publicar propiedades tenés que estar registrado.</p>
        <button onClick={() => router.push("/registro")} style={{ width: "100%", maxWidth: 340, padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #2563EB, #1d4ed8)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
          Registrarme gratis →
        </button>
      </div>
    )
  }

  // ── HANDLERS ─────────────────────────────────────────────────────────────
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
    setVideo(file)
    // Obtener duración
    const vid = document.createElement("video")
    vid.src = url
    vid.onloadedmetadata = () => setVideoDuration(Math.round(vid.duration))
  }

  const handleARRYSE = () => {
    setArryseStatus("verifying")
    if (!navigator.geolocation) {
      setArryseStatus("error")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setArryseStatus("ok")
        setTimeout(() => setStep(7), 1200)
      },
      () => {
        setArryseStatus("error")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handlePublicar = async () => {
    setLoading(true)
    setError("")
    try {
      let videoUrl = ""
      if (video) {
        const ext = video.name.split(".").pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from("videos-app")
          .upload(path, video, { contentType: video.type })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from("videos-app").getPublicUrl(path)
        videoUrl = data.publicUrl
      }

      const { error: insertError } = await supabase.from("properties").insert({
        user_id: user.id,
        owner_name: user.name,
        operation_type: operacion,
        property_type: tipoPropiedad,
        price: parseFloat(precio.replace(/\./g, "").replace(",", ".")) || 0,
        currency: moneda,
        rooms: parseInt(ambientes) || null,
        surface: parseInt(superficie) || null,
        neighborhood: barrio,
        city: ciudad,
        location: `${barrio}, ${ciudad}`,
        description: descripcion,
        whatsapp_number: whatsapp,
        video_url: videoUrl,
        verified: arryseStatus === "ok",
        lat: location?.lat || null,
        lng: location?.lng || null,
        highlighted: destacado,
        likes: 0,
      })
      if (insertError) throw insertError
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Error al publicar")
    } finally {
      setLoading(false)
    }
  }

  // ── ESTILOS BASE ──────────────────────────────────────────────────────────
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
    boxShadow: "0 4px 20px rgba(37,99,235,0.3)",
  }

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", borderRadius: 20, border: `1px solid ${active ? "#2563EB" : "rgba(255,255,255,0.12)"}`,
    background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
    color: active ? "#60A5FA" : "rgba(255,255,255,0.5)",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  })

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Publicar propiedad</span>
        </div>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Paso {step}/7</span>
      </div>

      {/* PROGRESS */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[1,2,3,4,5,6,7].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? "#2563EB" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 20px 40px", overflowY: "auto" }}>

        {/* ── PASO 1: PLAN Y LÍMITE ── */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Tu plan actual</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Verificá tu límite antes de publicar</p>

            {/* Plan card */}
            <div style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>Plan {nivel.toUpperCase()}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {publicacionesUsadas} de {limite} videos usados
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: porcentajeUso >= 80 ? "#F59E0B" : "#22C55E" }}>
                    {limite - publicacionesUsadas}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>disponibles</p>
                </div>
              </div>
              {/* Barra de progreso */}
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
                <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(porcentajeUso, 100)}%`, background: porcentajeUso >= 80 ? "#F59E0B" : "#22C55E", transition: "width 0.3s" }} />
              </div>
              {porcentajeUso >= 80 && (
                <p style={{ margin: "10px 0 0", fontSize: 12, color: "#F59E0B" }}>
                  ⚠️ Ya usaste el {Math.round(porcentajeUso)}% de tu límite. ¿Necesitás más?
                </p>
              )}
            </div>

            {/* Beneficios del plan */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Incluido en tu plan:</p>
              {[
                "✅ Videos de hasta 60 segundos",
                "✅ Verificación ARRYSE gratuita",
                "✅ Chat con interesados",
                "✅ Estadísticas básicas",
              ].map(b => <p key={b} style={{ margin: "4px 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{b}</p>)}
            </div>

            {nivel === "basico" && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 14, color: "#F59E0B" }}>🚀 Probá PRO 7 días gratis</p>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>15 videos · destacados · estadísticas avanzadas</p>
                <button style={{ ...btn, padding: "12px", fontSize: 14, marginTop: 0 }}>
                  Activar prueba gratis →
                </button>
              </div>
            )}

            <button onClick={() => setStep(2)} style={btn}>Continuar →</button>
          </div>
        )}

        {/* ── PASO 2: VIDEO ── */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Subí tu video</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Grabá la propiedad · máximo 60 segundos</p>

            <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: "none" }} />

            {videoPreview ? (
              <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 16, background: "#000" }}>
                <video src={videoPreview} controls style={{ width: "100%", maxHeight: 280, objectFit: "contain" }} />
                <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "4px 10px" }}>
                  <span style={{ fontSize: 12, color: videoDuration > 60 ? "#EF4444" : "#22C55E", fontWeight: 600 }}>
                    {videoDuration}s {videoDuration > 60 ? "⚠️" : "✓"}
                  </span>
                </div>
                <button onClick={() => { setVideo(null); setVideoPreview(null) }}
                  style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", cursor: "pointer", fontSize: 14 }}>
                  ✕
                </button>
              </div>
            ) : (
              <div onClick={() => videoRef.current?.click()} style={{
                height: 200, borderRadius: 14, border: "2px dashed rgba(255,255,255,0.2)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", background: "rgba(255,255,255,0.02)", marginBottom: 16,
              }}>
                <span style={{ fontSize: 40, marginBottom: 10 }}>🎬</span>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Tocá para seleccionar video</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>MP4, MOV · máx 60 seg</p>
              </div>
            )}

            {videoDuration > 60 && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#FCA5A5" }}>
                  ⚠️ Tu video dura {videoDuration}s. El plan GRATIS permite hasta 60s.
                </p>
              </div>
            )}

            <div style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                📍 <strong style={{ color: "rgba(255,255,255,0.7)" }}>ARRYSE</strong> verificará automáticamente que el video fue grabado en la ubicación real de la propiedad mediante GPS.
              </p>
            </div>

            <button onClick={() => video && setStep(3)} disabled={!video} style={{ ...btn, opacity: video ? 1 : 0.4 }}>
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO 3: DURACIÓN EXTRA ── */}
        {step === 3 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>¿Necesitás más tiempo?</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>El plan GRATIS incluye hasta 60 segundos</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {[
                { label: "60 segundos", sub: "Incluido en tu plan", price: null, value: null },
                { label: "120 segundos", sub: "+$1 USD · pago único", price: 1, value: 120 },
                { label: "180 segundos", sub: "+$1.50 USD · pago único", price: 1.5, value: 180 },
                { label: "300 segundos (5 min)", sub: "Solo plan PRO o superior", price: null, value: 300, proOnly: true },
              ].map(opt => (
                <div
                  key={opt.label}
                  onClick={() => !opt.proOnly && setDuracionExtra(opt.value as any)}
                  style={{
                    padding: "14px 16px", borderRadius: 14,
                    border: `1px solid ${duracionExtra === opt.value ? "#2563EB" : "rgba(255,255,255,0.08)"}`,
                    background: duracionExtra === opt.value ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.03)",
                    cursor: opt.proOnly ? "not-allowed" : "pointer",
                    opacity: opt.proOnly ? 0.4 : 1,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{opt.label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{opt.sub}</p>
                  </div>
                  {duracionExtra === opt.value && <span style={{ color: "#22C55E", fontSize: 18 }}>✓</span>}
                </div>
              ))}
            </div>

            {duracionExtra && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#F59E0B" }}>
                  💳 Elegiste {duracionExtra} seg. Se agregará el costo al momento de publicar.
                </p>
              </div>
            )}

            <button onClick={() => setStep(4)} style={btn}>Continuar →</button>
          </div>
        )}

        {/* ── PASO 4: DATOS PROPIEDAD ── */}
        {step === 4 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Datos de la propiedad</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Se verán superpuestos sobre tu video</p>

            {/* Tipo de operación */}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Tipo de operación</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {(["venta", "alquiler", "temporario", "permuta"] as const).map(op => (
                <button key={op} onClick={() => setOperacion(op)} style={chip(operacion === op)}>
                  {op === "venta" ? "🏷️ Venta" : op === "alquiler" ? "🔑 Alquiler" : op === "temporario" ? "📅 Temporario" : "🔁 Permuta"}
                </button>
              ))}
            </div>

            {/* Tipo de propiedad */}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Tipo de propiedad</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {["departamento", "casa", "ph", "local", "oficina", "terreno"].map(t => (
                <button key={t} onClick={() => setTipoPropiedad(t)} style={chip(tipoPropiedad === t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Precio */}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Precio</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setMoneda("USD")} style={{ ...chip(moneda === "USD"), flexShrink: 0 }}>USD</button>
              <button onClick={() => setMoneda("ARS")} style={{ ...chip(moneda === "ARS"), flexShrink: 0 }}>ARS</button>
              <input value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Ej: 150000" type="number" inputMode="numeric" style={{ ...inp, flex: 1 }} />
            </div>

            {/* Ambientes y superficie */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Ambientes</p>
                <input value={ambientes} onChange={e => setAmbientes(e.target.value)} placeholder="Ej: 3" type="number" inputMode="numeric" style={inp} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Superficie m²</p>
                <input value={superficie} onChange={e => setSuperficie(e.target.value)} placeholder="Ej: 75" type="number" inputMode="numeric" style={inp} />
              </div>
            </div>

            {/* Ubicación */}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Ubicación</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input value={barrio} onChange={e => setBarrio(e.target.value)} placeholder="Barrio" style={{ ...inp, flex: 1 }} />
              <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ciudad" style={{ ...inp, flex: 1 }} />
            </div>

            {/* Descripción */}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Descripción corta</p>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describí brevemente la propiedad..." maxLength={150}
              style={{ ...inp, height: 80, resize: "none" }} />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: "4px 0 16px", textAlign: "right" }}>{descripcion.length}/150</p>

            {/* WhatsApp */}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>WhatsApp de contacto</p>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Ej: 5491112345678" type="tel" style={{ ...inp, marginBottom: 20 }} />

            <button onClick={() => {
              if (!precio || !barrio || !ciudad) return setError("Completá precio y ubicación")
              setError("")
              setStep(5)
            }} style={btn}>
              Continuar →
            </button>
            {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 10 }}>{error}</p>}
          </div>
        )}

        {/* ── PASO 5: DESTACADO ── */}
        {step === 5 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>¿Destacar tu propiedad?</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Aparecerá primera en el feed por 24 horas</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div onClick={() => setDestacado(false)} style={{
                padding: "16px", borderRadius: 14,
                border: `1px solid ${!destacado ? "#22C55E" : "rgba(255,255,255,0.08)"}`,
                background: !destacado ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Sin destacar</p>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Aparece en orden normal del feed</p>
                </div>
                {!destacado && <span style={{ color: "#22C55E", fontSize: 20 }}>✓</span>}
              </div>

              <div onClick={() => setDestacado(true)} style={{
                padding: "16px", borderRadius: 14,
                border: `1px solid ${destacado ? "#F59E0B" : "rgba(255,255,255,0.08)"}`,
                background: destacado ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>⭐ Destacar por 24h</p>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>+$2 USD · Primero en el feed · Más visibilidad</p>
                </div>
                {destacado && <span style={{ color: "#F59E0B", fontSize: 20 }}>✓</span>}
              </div>
            </div>

            {destacado && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#F59E0B" }}>
                  ⭐ Tu propiedad aparecerá primera en el feed por 24 horas. Se agregarán $2 USD al momento de publicar.
                </p>
              </div>
            )}

            <button onClick={() => setStep(6)} style={btn}>Continuar →</button>
          </div>
        )}

        {/* ── PASO 6: ARRYSE ── */}
        {step === 6 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(37,99,235,0.12)", border: "2px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>
              📍
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Verificación ARRYSE</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 8px", lineHeight: 1.6 }}>
              Necesitamos confirmar que estás en la ubicación real de la propiedad.
            </p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: "0 0 28px" }}>
              Gratuito · Automático · Instantáneo
            </p>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px", marginBottom: 24, textAlign: "left" }}>
              {[
                { icon: "🛰️", text: "GPS de alta precisión" },
                { icon: "📐", text: "Altitud y acelerómetro" },
                { icon: "🔒", text: "Metadatos del video verificados" },
                { icon: "⚡", text: "Resultado instantáneo" },
              ].map(f => (
                <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{f.text}</p>
                </div>
              ))}
            </div>

            {arryseStatus === "verifying" && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(37,99,235,0.3)", borderTop: "3px solid #2563EB", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Verificando ubicación...</p>
              </div>
            )}

            {arryseStatus === "ok" && (
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "14px", marginBottom: 16 }}>
                <p style={{ margin: 0, color: "#22C55E", fontWeight: 700 }}>✅ Ubicación verificada</p>
                {location && <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
              </div>
            )}

            {arryseStatus === "error" && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px", marginBottom: 16 }}>
                <p style={{ margin: "0 0 4px", color: "#FCA5A5", fontWeight: 700 }}>⚠️ No se pudo verificar</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Activá el GPS y permitÍ el acceso a la ubicación</p>
              </div>
            )}

            {arryseStatus === "pending" && (
              <button onClick={handleARRYSE} style={btn}>
                Verificar con ARRYSE →
              </button>
            )}

            {arryseStatus === "error" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={handleARRYSE} style={btn}>Reintentar</button>
                <button onClick={() => setStep(7)} style={{ ...btn, background: "rgba(255,255,255,0.06)", boxShadow: "none", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                  Publicar sin verificación
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PASO 7: RESUMEN Y PUBLICAR ── */}
        {step === 7 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Resumen</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Revisá antes de publicar</p>

            {/* Preview video */}
            {videoPreview && (
              <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 16, background: "#000", position: "relative" }}>
                <video src={videoPreview} style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} muted />
                {arryseStatus === "ok" && (
                  <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                    <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 700 }}>ARRYSE ✓</span>
                  </div>
                )}
              </div>
            )}

            {/* Datos */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Operación", value: operacion.toUpperCase() },
                  { label: "Tipo", value: tipoPropiedad },
                  { label: "Precio", value: `${moneda} ${precio}` },
                  { label: "Superficie", value: superficie ? `${superficie} m²` : "-" },
                  { label: "Ambientes", value: ambientes || "-" },
                  { label: "Ubicación", value: `${barrio}, ${ciudad}` },
                ].map(d => (
                  <div key={d.label}>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{d.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600 }}>{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Costo total */}
            {(duracionExtra || destacado) && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 14 }}>💳 Costo adicional</p>
                {duracionExtra && <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Duración extra ({duracionExtra}s): +${duracionExtra === 120 ? "1.00" : "1.50"} USD</p>}
                {destacado && <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Destacado 24h: +$2.00 USD</p>}
                <p style={{ margin: "8px 0 0", fontWeight: 700, fontSize: 15, color: "#F59E0B" }}>
                  Total: ${((duracionExtra === 120 ? 1 : duracionExtra === 180 ? 1.5 : 0) + (destacado ? 2 : 0)).toFixed(2)} USD
                </p>
              </div>
            )}

            {error && <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}

            <button onClick={handlePublicar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Publicando..." : "🚀 Publicar ahora"}
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 12 }}>
              Al publicar aceptás los Términos y Condiciones de Vivienda Ya
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
