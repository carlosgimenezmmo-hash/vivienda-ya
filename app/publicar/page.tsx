"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

type Step = 1 | 2 | 3 | 4 | 5 | 6

const PLAN_LIMITS: Record<string, number> = {
  basico: 3, pro: 15, premium: 50, plus: 100,
}

// Detecta si es mobile real (no desktop)
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export default function PublicarPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()

  const [isMobile, setIsMobile] = useState(true) // optimistic default
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [duracionElegida, setDuracionElegida] = useState<60 | 120 | 180>(60)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [gpsStatus, setGpsStatus] = useState<"idle" | "capturing" | "ok" | "error">("idle")
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null)

  const [operacion, setOperacion] = useState<"venta" | "alquiler" | "temporario" | "permuta">("venta")
  const [tipoPropiedad, setTipoPropiedad] = useState("Departamento")
  const [precio, setPrecio] = useState("")
  const [moneda, setMoneda] = useState<"USD" | "ARS">("USD")
  const [ambientes, setAmbientes] = useState("")
  const [superficie, setSuperficie] = useState("")
  const [barrio, setBarrio] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [destacado, setDestacado] = useState(false)

  const nivel = user?.level || "basico"
  const limite = PLAN_LIMITS[nivel] || 3
  const publicacionesUsadas = 0
  const porcentajeUso = (publicacionesUsadas / limite) * 100

  // Detectar desktop al montar
  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  // GPS — solo se activa en mobile
  useEffect(() => {
    if (!isMobile) return
    if (navigator.geolocation) {
      setGpsStatus("capturing")
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setGpsStatus("ok")
        },
        () => setGpsStatus("error"),
        { enableHighAccuracy: true, timeout: 15000 }
      )
    }
  }, [isMobile])

  const handleVideoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Verificar que es un video real (no archivo de escritorio trucado)
    if (!file.type.startsWith("video/")) {
      setError("Solo se aceptan videos grabados desde la cámara")
      return
    }
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
    setVideo(file)
    const vid = document.createElement("video")
    vid.src = url
    vid.onloadedmetadata = () => setVideoDuration(Math.round(vid.duration))
  }

  const handlePublicar = async () => {
    if (gpsStatus !== "ok") {
      setError("El GPS es obligatorio para verificar la ubicación (sistema ARRYSE). Activá la ubicación e intentá de nuevo.")
      return
    }
    if (!video) {
      setError("Grabá un video de la propiedad antes de publicar")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Obtener sesión real de Supabase
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      let videoUrl = ""

      if (video) {
        const ext = video.name.split(".").pop() || "mp4"
        // Usar UID de Supabase si existe, sino usar user.id del mock
        const uid = session?.user?.id || user!.id
        const path = `${uid}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("videos-app")
          .upload(path, video, {
            contentType: video.type,
            upsert: false,
          })

        if (uploadError) {
          // Si falla por auth, intentar con upload público
          if (uploadError.message.includes("row-level") || uploadError.message.includes("policy") || uploadError.message.includes("Unauthorized")) {
            throw new Error("Tu sesión expiró. Por favor cerrá sesión y volvé a entrar.")
          }
          throw uploadError
        }

        const { data: urlData } = supabase.storage.from("videos-app").getPublicUrl(path)
        videoUrl = urlData.publicUrl
      }

      const insertPayload: Record<string, any> = {
        owner_name: user!.name,
        operation_type: operacion,
        property_type: tipoPropiedad,
        price: parseFloat(precio) || 0,
        currency: moneda,
        rooms: parseInt(ambientes) || null,
        surface: parseInt(superficie) || null,
        neighborhood: barrio,
        city: ciudad,
        location: `${barrio}, ${ciudad}`,
        description: descripcion,
        whatsapp_number: whatsapp,
        video_url: videoUrl,
        verified: gpsStatus === "ok",
        lat: gpsLocation?.lat || null,
        lng: gpsLocation?.lng || null,
        highlighted: destacado,
      likes: 0,
      }).select().single()

      // Solo agregar user_id si hay sesión real de Supabase
      if (session?.user?.id) {
        insertPayload.user_id = session.user.id
      }

     const { data: insertData, error: insertError } = await supabase.from("properties").insert({

      if (insertError) {
        if (insertError.message.includes("row-level") || insertError.message.includes("policy")) {
          throw new Error("Error de permisos. Verificá que tenés sesión activa.")
        }
        throw insertError
      }

     // Moderación en background — no bloquea al usuario
fetch('/api/moderar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ propertyId: insertData?.id, videoUrl: videoUrl }),
}).catch(() => {})

router.push("/")
    } catch (err: any) {
      setError(err.message || "Error al publicar. Intentá de nuevo.")
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
    boxShadow: "0 4px 20px rgba(37,99,235,0.3)",
  }
  const chip = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px", borderRadius: 20,
    border: `1px solid ${active ? "#2563EB" : "rgba(255,255,255,0.12)"}`,
    background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
    color: active ? "#60A5FA" : "rgba(255,255,255,0.5)",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  })

  // BLOQUEO DESKTOP — pantalla de redirección a celular
  if (!isMobile) {
    return (
      <div style={{
        minHeight: "100dvh", background: "#0a0a0a", color: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "0 32px", textAlign: "center",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(37,99,235,0.12)", border: "2px solid rgba(37,99,235,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, marginBottom: 24,
        }}>📱</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px" }}>
          Publicá desde tu celular
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: "0 0 12px", lineHeight: 1.6 }}>
          Para publicar una propiedad necesitás grabar el video <strong style={{ color: "rgba(255,255,255,0.7)" }}>en el lugar</strong>, con la cámara de tu teléfono.
        </p>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: "0 0 32px", lineHeight: 1.5 }}>
          Esto es parte del sistema <strong style={{ color: "#22C55E" }}>ARRYSE</strong> que verifica que el video fue grabado en la propiedad real mediante GPS. No se aceptan archivos subidos desde la computadora.
        </p>
        <div style={{
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 14, padding: "16px 20px", marginBottom: 28, width: "100%", maxWidth: 360,
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#22C55E" }}>🛡️ Sistema ARRYSE</p>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            Verificación GPS en tiempo real · Sin fraude · Video geolocalizando la propiedad
          </p>
        </div>
        <button
          onClick={() => router.back()}
          style={{ ...btn, maxWidth: 360, background: "rgba(255,255,255,0.06)", boxShadow: "none", color: "rgba(255,255,255,0.6)" }}
        >
          ← Volver
        </button>
      </div>
    )
  }

  // BLOQUEO NO LOGUEADO
  if (!isLoggedIn || !user) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <span style={{ fontSize: 48, marginBottom: 16 }}>🔒</span>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>Necesitás una cuenta</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", margin: "0 0 28px" }}>Para publicar propiedades tenés que estar registrado.</p>
        <button onClick={() => router.push("/registro")} style={btn}>Registrarme gratis →</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Input de video — solo cámara, sin archivos */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleVideoCapture}
        style={{ display: "none" }}
      />

      {/* Header */}
      <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span style={{ fontSize: 18, fontWeight: 800, flex: 1 }}>Publicar propiedad</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Paso {step}/6</span>
      </div>

      {/* Barra de progreso */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[1,2,3,4,5,6].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? "#2563EB" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 20px 40px", overflowY: "auto" }}>

        {/* PASO 1 — Plan */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Tu plan</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Videos disponibles este mes</p>
            <div style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>Plan {nivel.toUpperCase()}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{publicacionesUsadas} de {limite} videos usados</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: porcentajeUso >= 80 ? "#F59E0B" : "#22C55E" }}>{limite - publicacionesUsadas}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>disponibles</p>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
                <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(porcentajeUso, 100)}%`, background: porcentajeUso >= 80 ? "#F59E0B" : "#22C55E" }} />
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              {["✅ Videos de hasta 60 segundos", "✅ Verificación ARRYSE gratuita", "✅ Chat con interesados"].map(b => (
                <p key={b} style={{ margin: "4px 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{b}</p>
              ))}
            </div>
            {nivel === "basico" && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#F59E0B" }}>🚀 Probá PRO 7 días gratis</p>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>15 videos · estadísticas avanzadas · destacados</p>
                <button style={{ ...btn, padding: "12px", fontSize: 14 }}>Activar prueba gratis →</button>
              </div>
            )}
            <button onClick={() => setStep(2)} style={btn}>Continuar →</button>
          </div>
        )}

        {/* PASO 2 — Duración */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>¿Cuánto dura tu video?</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Elegí antes de grabar</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {[
                { seg: 60, label: "60 segundos", sub: "Incluido en tu plan · Gratis" },
                { seg: 120, label: "120 segundos", sub: "+USD 1.00 · pago único" },
                { seg: 180, label: "180 segundos", sub: "+USD 1.50 · pago único" },
              ].map((op) => (
                <div key={op.seg} onClick={() => setDuracionElegida(op.seg as 60 | 120 | 180)} style={{
                  padding: "16px", borderRadius: 14,
                  border: `1px solid ${duracionElegida === op.seg ? "#2563EB" : "rgba(255,255,255,0.08)"}`,
                  background: duracionElegida === op.seg ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{op.label}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{op.sub}</p>
                  </div>
                  {duracionElegida === op.seg && <span style={{ color: "#22C55E", fontSize: 20 }}>✓</span>}
                </div>
              ))}
              <div style={{ padding: "16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", opacity: 0.4 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>300 segundos (5 min)</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Solo plan PRO o superior</p>
              </div>
            </div>
            {duracionElegida > 60 && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#F59E0B" }}>💳 Elegiste {duracionElegida}s. Se cobrarán USD {duracionElegida === 120 ? "1.00" : "1.50"} al publicar.</p>
              </div>
            )}
            <button onClick={() => setStep(3)} style={btn}>Continuar →</button>
          </div>
        )}
        {step === 3 && (
          <div style={{ paddingBottom: 120 }}>
           <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Grabá la propiedad</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 16px" }}>Tenés {duracionElegida} segundos · Grabá desde adentro y afuera</p>
            <div style={{
      
              background: gpsStatus === "ok" ? "rgba(34,197,94,0.08)" : gpsStatus === "error" ? "rgba(239,68,68,0.08)" : "rgba(37,99,235,0.08)",
              border: `1px solid ${gpsStatus === "ok" ? "rgba(34,197,94,0.25)" : gpsStatus === "error" ? "rgba(239,68,68,0.25)" : "rgba(37,99,235,0.25)"}`,
              borderRadius: 12, padding: "12px 14px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>{gpsStatus === "ok" ? "📍" : gpsStatus === "error" ? "⚠️" : "🛰️"}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: gpsStatus === "ok" ? "#22C55E" : gpsStatus === "error" ? "#FCA5A5" : "#60A5FA" }}>
                  {gpsStatus === "ok" ? "ARRYSE: Ubicación capturada ✓" : gpsStatus === "error" ? "ARRYSE: GPS requerido — activá la ubicación" : "ARRYSE: Capturando ubicación..."}
                </p>
                {gpsLocation && <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}</p>}
                {gpsStatus === "error" && (
                  <button
                    onClick={() => {
                      setGpsStatus("capturing")
                      navigator.geolocation.getCurrentPosition(
                        (pos) => { setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus("ok") },
                        () => setGpsStatus("error"),
                        { enableHighAccuracy: true, timeout: 15000 }
                      )
                    }}
                    style={{ marginTop: 6, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, color: "#FCA5A5", fontSize: 12, padding: "4px 10px", cursor: "pointer" }}
                  >
                    Reintentar GPS
                  </button>
                )}
              </div>
            </div>

            {/* Aviso GPS obligatorio */}
            {gpsStatus === "error" && (
              <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#FCA5A5", lineHeight: 1.5 }}>
                  ⛔ No podés publicar sin GPS activo. El sistema ARRYSE requiere verificar que el video fue grabado en la propiedad. Activá la ubicación en la configuración de tu celular.
                </p>
              </div>
            )}

            {!video ? (
              <div>
                <div
                  onClick={() => gpsStatus === "ok" ? videoInputRef.current?.click() : setError("Activá el GPS primero")}
                  style={{
                    height: 220, borderRadius: 16,
                    background: gpsStatus === "ok"
                      ? "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))"
                      : "rgba(255,255,255,0.02)",
                    border: `2px dashed ${gpsStatus === "ok" ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.1)"}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: gpsStatus === "ok" ? "pointer" : "not-allowed", marginBottom: 16,
                    opacity: gpsStatus === "ok" ? 1 : 0.5,
                  }}
                >
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 32 }}>🎥</div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>
                    {gpsStatus === "ok" ? "Tocá para grabar" : gpsStatus === "capturing" ? "Esperando GPS..." : "GPS requerido"}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                    {gpsStatus === "ok" ? `Se abre la cámara · ${duracionElegida} seg máximo` : "Activá la ubicación para continuar"}
                  </p>
                </div>
                {error && <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 10px" }}>{error}</p>}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>CONSEJOS PARA UN BUEN VIDEO</p>
                  {["🌅 Grabá con buena luz natural", "🚶 Recorré todos los ambientes", "📐 Mostrá espacios y medidas", "🏡 Grabá también el exterior"].map(c => (
                    <p key={c} style={{ margin: "4px 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{c}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 16, background: "#000" }}>
                  <video src={videoPreview!} controls style={{ width: "100%", maxHeight: 280, objectFit: "contain" }} />
                  {gpsStatus === "ok" && (
                    <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                      <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 700 }}>ARRYSE ✓</span>
                    </div>
                  )}
                  <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", borderRadius: 20, padding: "4px 10px" }}>
                    <span style={{ fontSize: 12, color: videoDuration > duracionElegida ? "#EF4444" : "#22C55E", fontWeight: 600 }}>{videoDuration}s</span>
                  </div>
                </div>
                {videoDuration > duracionElegida && (
                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#FCA5A5" }}>⚠️ El video dura {videoDuration}s, más de los {duracionElegida}s elegidos.</p>
                  </div>
                )}
                <button onClick={() => { setVideo(null); setVideoPreview(null); setError("") }} style={{ ...btn, background: "rgba(255,255,255,0.06)", boxShadow: "none", color: "rgba(255,255,255,0.6)", marginBottom: 10, fontSize: 14 }}>
                  Volver a grabar
                </button>
                <button onClick={() => setStep(4)} style={btn}>Usar este video →</button>
              </div>
            )}
          </div>
        )}

        {/* PASO 4 — Datos */}
        {step === 4 && (
          <div style={{ paddingBottom: 100 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Datos de la propiedad</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Se verán sobre el video en el feed</p>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Tipo de operación</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {(["venta", "alquiler", "temporario", "permuta"] as const).map(op => (
                <button key={op} onClick={() => setOperacion(op)} style={chip(operacion === op)}>
                  {op === "venta" ? "🏷️ Venta" : op === "alquiler" ? "🔑 Alquiler" : op === "temporario" ? "📅 Temporario" : "🔁 Permuta"}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Tipo de propiedad</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {['Departamento', 'Casa', 'PH', 'Local', 'Oficina', 'Terreno', 'Loft', 'Monoambiente', 'Cabaña', 'Duplex', 'Cochera', 'Galpón'].map(t => (
                <button key={t} onClick={() => setTipoPropiedad(t)} style={chip(tipoPropiedad === t)}>{t}</button>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Precio</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setMoneda("USD")} style={{ ...chip(moneda === "USD"), flexShrink: 0 }}>USD</button>
              <button onClick={() => setMoneda("ARS")} style={{ ...chip(moneda === "ARS"), flexShrink: 0 }}>ARS</button>
              <input value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Precio" type="number" inputMode="numeric" style={{ ...inp, flex: 1 }} />
            </div>

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

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Ubicación</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input value={barrio} onChange={e => setBarrio(e.target.value)} placeholder="Barrio" style={{ ...inp, flex: 1 }} />
              <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ciudad" style={{ ...inp, flex: 1 }} />
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Descripción corta</p>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describí brevemente la propiedad..." maxLength={150}
              style={{ ...inp, height: 80, resize: "none" }} />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: "4px 0 16px", textAlign: "right" }}>{descripcion.length}/150</p>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>WhatsApp de contacto</p>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Ej: 5491112345678" type="tel" style={{ ...inp, marginBottom: 20 }} />

            {error && <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 10px" }}>{error}</p>}
            <button onClick={() => {
              if (!precio || !barrio || !ciudad) return setError("Completá precio y ubicación")
              setError(""); setStep(5)
            }} style={btn}>Continuar →</button>
          </div>
        )}

        {/* PASO 5 — Destacar */}
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
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Aparece en orden normal · Gratis</p>
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
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>+USD 2.00 · Primero en el feed</p>
                </div>
                {destacado && <span style={{ color: "#F59E0B", fontSize: 20 }}>✓</span>}
              </div>
            </div>
            <button onClick={() => setStep(6)} style={btn}>Continuar →</button>
          </div>
        )}

        {/* PASO 6 — Resumen y publicar */}
        {step === 6 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Resumen</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 16px" }}>Revisá antes de publicar</p>

            {videoPreview && (
              <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 16, background: "#000", position: "relative" }}>
                <video src={videoPreview} style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} muted />
                {gpsStatus === "ok" && (
                  <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.75)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                    <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 700 }}>ARRYSE ✓</span>
                  </div>
                )}
              </div>
            )}

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

            {(duracionElegida > 60 || destacado) && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 14 }}>💳 Costo adicional</p>
                {duracionElegida > 60 && <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Duración extra ({duracionElegida}s): +USD {duracionElegida === 120 ? "1.00" : "1.50"}</p>}
                {destacado && <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Destacado 24h: +USD 2.00</p>}
                <p style={{ margin: "8px 0 0", fontWeight: 700, fontSize: 15, color: "#F59E0B" }}>
                  Total: USD {((duracionElegida === 120 ? 1 : duracionElegida === 180 ? 1.5 : 0) + (destacado ? 2 : 0)).toFixed(2)}
                </p>
              </div>
            )}

            {error && <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>{error}</p>}

            <button onClick={handlePublicar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Publicando..." : "🚀 Publicar ahora"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 12 }}>
              Al publicar aceptás los Términos y Condiciones de Vivienda Ya
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
