"use client"
import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function PublicarPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Paso 1 - Plan
  const [planElegido, setPlanElegido] = useState("gratis")

  // Paso 2 - Video
  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [gpsLat, setGpsLat] = useState<number | null>(null)
  const [gpsLng, setGpsLng] = useState<number | null>(null)
  const [gpsOk, setGpsOk] = useState(false)
  const videoRef = useRef<HTMLInputElement>(null)

  // Paso 3 - Datos
  const [operacion, setOperacion] = useState("venta")
  const [tipoPropiedad, setTipoPropiedad] = useState("")
  const [precio, setPrecio] = useState("")
  const [moneda, setMoneda] = useState("USD")
  const [ambientes, setAmbientes] = useState("")
  const [superficie, setSuperficie] = useState("")
  const [barrio, setBarrio] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  // Paso 4 - Destacar
  const [destacar, setDestacar] = useState("sin")

  const totalSteps = 5

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLat(pos.coords.latitude)
          setGpsLng(pos.coords.longitude)
          setGpsOk(true)
        },
        () => setGpsOk(false)
      )
    }
  }, [])

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideo(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const handlePublicar = async () => {
    setLoading(true)
    setError("")
    try {
      let videoUrl = ""
      if (video) {
        const ext = video.name.split(".").pop()
        const path = `${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from("videos-app")
          .upload(path, video, { contentType: video.type })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from("videos-app").getPublicUrl(path)
        videoUrl = data.publicUrl
      }

      const { error: insertError } = await supabase.from("properties").insert({
        user_id: user?.id || null,
       owner_name: user?.name || "Propietario",
owner_avatar: user?.avatar_url || null,
        operation_type: operacion,
        property_type: tipoPropiedad,
        price: parseFloat(precio) || 0,
        rooms: parseInt(ambientes) || null,
        surface: parseInt(superficie) || null,
        neighborhood: barrio,
        city: ciudad,
        location: `${barrio}, ${ciudad}`,
        description: descripcion,
        whatsapp_number: whatsapp,
        video_url: videoUrl,
        verified: gpsOk,
        lat: gpsLat,
        lng: gpsLng,
        highlighted: destacar !== "sin",
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

  const card = (active: boolean): React.CSSProperties => ({
    width: "100%", padding: "16px", borderRadius: 14, marginBottom: 12,
    border: `2px solid ${active ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
    background: active ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
    cursor: "pointer", textAlign: "left",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  })

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px", borderRadius: 20,
    border: `1px solid ${active ? "#2563EB" : "rgba(255,255,255,0.12)"}`,
    background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
    color: active ? "#60A5FA" : "rgba(255,255,255,0.5)",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  })

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <span style={{ fontSize: 48, marginBottom: 16 }}>🔒</span>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>Necesitas una cuenta</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", margin: "0 0 28px" }}>Para publicar propiedades tenes que estar registrado.</p>
        <button onClick={() => router.push("/registro")} style={btn}>Registrarme gratis</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column", paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>Publicar propiedad</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 10 }}>Paso {step}/{totalSteps}</span>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ padding: "0 20px 24px", display: "flex", gap: 6 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? "#2563EB" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
        ))}
      </div>

      <div style={{ flex: 1, padding: "0 20px", overflowY: "auto" }}>
{/* PASO 1 - PLAN */}
        {step === 1 && (
          <div style={{ paddingBottom: 100 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Tu plan</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Videos disponibles este mes</p>

            <button onClick={() => setPlanElegido("gratis")} style={card(planElegido === "gratis")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#fff" }}>Plan GRATIS</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>3 videos/mes · 60 seg · Chat incluido</p>
                </div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#22C55E" }}>$0</p>
              </div>
            </button>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "16px 0 10px", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Videos extra</p>

            <button onClick={() => setPlanElegido("extra1")} style={card(planElegido === "extra1")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#fff" }}>1 video extra</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Pago unico</p>
                </div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#60A5FA" }}>USD 1</p>
              </div>
            </button>

            <button onClick={() => setPlanElegido("pack5")} style={card(planElegido === "pack5")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#fff" }}>Pack 5 videos</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Ahorro 20%</p>
                </div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#60A5FA" }}>USD 4</p>
              </div>
            </button>

            <button onClick={() => setPlanElegido("pack10")} style={card(planElegido === "pack10")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#fff" }}>Pack 10 videos</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Ahorro 30%</p>
                </div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#60A5FA" }}>USD 7</p>
              </div>
            </button>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "16px 0 10px", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Duracion del video</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              {[
                { id: "gratis", label: "60 seg", precio: "Incluido", color: "#22C55E" },
                { id: "v120", label: "120 seg", precio: "USD 1", color: "#60A5FA" },
                { id: "v180", label: "180 seg", precio: "USD 2", color: "#60A5FA" },
                { id: "v300", label: "300 seg", precio: "USD 4", color: "#60A5FA" },
              ].map((v) => (
                <button key={v.id + "-dur"} onClick={() => setPlanElegido(v.id)} style={{
                  ...card(planElegido === v.id),
                  padding: "14px",
                  textAlign: "center" as const,
                }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "#fff" }}>{v.label}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: v.color, fontWeight: 700 }}>{v.precio}</p>
                </button>
              ))}
            </div>

           {/* BOTON FIJO */}
      {step === 1 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px 32px", background: "rgba(10,10,10,0.95)", borderTop: "1px solid rgba(255,255,255,0.08)", zIndex: 20 }}>
          <button onClick={() => setStep(2)} style={btn}>Continuar</button>
        </div>
      )}
          </div>
        )}

        {/* PASO 2 - VIDEO */}
        {step === 2 && (
          <div style={{ paddingBottom: 100 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Graba la propiedad</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 16px" }}>
              Tenes {planElegido === "v120" ? "120" : planElegido === "v180" ? "180" : planElegido === "v300" ? "300" : "60"} segundos
            </p>

            {/* GPS ARRYSE */}
            <div style={{
              padding: "12px 16px", borderRadius: 12, marginBottom: 16,
              background: gpsOk ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${gpsOk ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gpsOk ? "#10B981" : "#EF4444"} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: gpsOk ? "#10B981" : "#EF4444" }}>
                  ARRYSE: {gpsOk ? "Ubicacion capturada" : "Capturando ubicacion..."}
                </p>
                {gpsOk && <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{gpsLat?.toFixed(4)}, {gpsLng?.toFixed(4)}</p>}
              </div>
            </div>

            <input ref={videoRef} type="file" accept="video/*" capture="environment" onChange={handleVideo} style={{ display: "none" }} />

            {!videoPreview ? (
              <div onClick={() => videoRef.current?.click()} style={{
                height: 260, borderRadius: 16,
                border: "2px dashed rgba(37,99,235,0.4)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", background: "rgba(37,99,235,0.05)",
              }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.9L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginTop: 12 }}>Toca para grabar</p>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 4 }}>Se abre la camara</p>
              </div>
            ) : (
              <div>
                <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
                  {gpsOk && (
                    <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, background: "rgba(16,185,129,0.9)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                      <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>ARRYSE</span>
                    </div>
                  )}
                  <video src={videoPreview} style={{ width: "100%", borderRadius: 16, maxHeight: 300, objectFit: "cover" }} controls />
                </div>
                <button onClick={() => { setVideo(null); setVideoPreview(null); }} style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: 15,
                  cursor: "pointer", marginBottom: 12, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                }}>
                  Volver a grabar
                </button>
                <button onClick={() => setStep(3)} style={btn}>Usar este video</button>
              </div>
            )}

            <div style={{ marginTop: 20, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16 }}>
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}>CONSEJOS PARA UN BUEN VIDEO</p>
              {["Graba con buena luz natural", "Recorre todos los ambientes", "Mostra espacios y medidas", "Graba tambien el exterior"].map((tip, i) => (
                <p key={i} style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>• {tip}</p>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3 - DATOS */}
        {step === 3 && (
          <div style={{ paddingBottom: 100 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Datos de la propiedad</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Se veran sobre el video en el feed</p>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Tipo de operacion</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {[["venta", "Venta"], ["alquiler", "Alquiler"], ["temporario", "Temporario"], ["permuta", "Permuta"]].map(([val, label]) => (
                <button key={val} onClick={() => setOperacion(val)} style={chip(operacion === val)}>{label}</button>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Tipo de propiedad</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {["Departamento", "Casa", "PH", "Local", "Oficina", "Terreno", "Loft", "Monoambiente", "Cabana", "Duplex", "Cochera", "Galpon"].map(t => (
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
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Superficie m2</p>
                <input value={superficie} onChange={e => setSuperficie(e.target.value)} placeholder="Ej: 75" type="number" inputMode="numeric" style={inp} />
              </div>
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Ubicacion</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input value={barrio} onChange={e => setBarrio(e.target.value)} placeholder="Barrio" style={{ ...inp, flex: 1 }} />
              <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ciudad" style={{ ...inp, flex: 1 }} />
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Descripcion corta</p>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describe brevemente la propiedad..." maxLength={150}
              style={{ ...inp, height: 80, resize: "none", marginBottom: 4 }} />
            <p style={{ textAlign: "right", color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "0 0 16px" }}>{descripcion.length}/150</p>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>WhatsApp de contacto</p>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Ej: 5491112345678" type="tel" style={{ ...inp, marginBottom: 20 }} />

            <button onClick={() => setStep(4)} style={btn}>                                                                   
          </div>
        )}

        {/* PASO 4 - DESTACAR */}
        {step === 4 && (
          <div style={{ paddingBottom: 100 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Destacar tu propiedad?</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Aparece primero en el feed</p>

            <button onClick={() => setDestacar("sin")} style={card(destacar === "sin")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#fff" }}>Sin destacar</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Aparece en orden normal</p>
                </div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#22C55E" }}>Gratis</p>
              </div>
            </button>

            <button onClick={() => setDestacar("24h")} style={card(destacar === "24h")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#fff" }}>Destacar 24 horas</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Primero en el feed por 1 dia</p>
                </div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#60A5FA" }}>USD 1</p>
              </div>
            </button>

            <button onClick={() => setDestacar("7d")} style={card(destacar === "7d")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#fff" }}>Destacar 7 dias</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Prioridad toda la semana · Ahorro 30%</p>
                </div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#60A5FA" }}>USD 5</p>
              </div>
            </button>

            <button onClick={() => setStep(5)} style={{ ...btn, marginTop: 8 }}>Continuar</button>
          </div>
        )}

        {/* PASO 5 - RESUMEN Y PUBLICAR */}
        {step === 5 && (
          <div style={{ paddingBottom: 100 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Todo listo!</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Revisa los datos antes de publicar</p>

            {videoPreview && (
              <video src={videoPreview} style={{ width: "100%", borderRadius: 14, maxHeight: 200, objectFit: "cover", marginBottom: 16 }} />
            )}

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Operacion</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{operacion}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Tipo</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{tipoPropiedad || "No especificado"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Precio</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{moneda} {parseInt(precio).toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Ubicacion</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{barrio}, {ciudad}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Destacar</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{destacar === "sin" ? "No" : destacar === "24h" ? "24 horas" : "7 dias"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>ARRYSE GPS</span>
                <span style={{ color: gpsOk ? "#22C55E" : "#EF4444", fontSize: 13, fontWeight: 600 }}>{gpsOk ? "Verificado" : "No verificado"}</span>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <button onClick={handlePublicar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Publicando..." : "Publicar ahora"}
            </button>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center", marginTop: 12 }}>
              Al publicar aceptas los Terminos y Condiciones de Vivienda Ya
            </p>
          </div>
        )}

      </div>
    {step === 1 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px 32px", background: "rgba(10,10,10,0.95)", borderTop: "1px solid rgba(255,255,255,0.08)", zIndex: 20 }}>
          <button onClick={() => setStep(2)} style={btn}>Continuar</button>
        </div>
      )}
        
    </div>
  )
}
