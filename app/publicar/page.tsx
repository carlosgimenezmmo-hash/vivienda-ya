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
  const [planElegido, setPlanElegido] = useState("gratis")
  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [gpsLat, setGpsLat] = useState<number | null>(null)
  const [gpsLng, setGpsLng] = useState<number | null>(null)
  const [gpsOk, setGpsOk] = useState(false)
  const videoRef = useRef<HTMLInputElement>(null)
  const [operacion, setOperacion] = useState("venta")
  const [tipoPropiedad, setTipoPropiedad] = useState("")
  const [precio, setPrecio] = useState("")
  const [moneda, setMoneda] = useState("USD")
  const [ambientes, setAmbientes] = useState("")
  const [superficie, setSuperficie] = useState("")
  const [barrio, setBarrio] = useState("")
  const [ciudad, setCiudad] = useState("")
 const [titulo, setTitulo] = useState("")
const [descripcion, setDescripcion] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [destacar, setDestacar] = useState("sin")
  const totalSteps = 5

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setGpsLat(pos.coords.latitude); setGpsLng(pos.coords.longitude); setGpsOk(true) },
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
        const { error: uploadError } = await supabase.storage.from("videos-app").upload(path, video, { contentType: video.type })
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
       title: titulo,
       title: titulo,
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
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", textAlign: "center" }}>Necesitas una cuenta</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", margin: "0 0 28px" }}>Para publicar propiedades tenes que estar registrado.</p>
        <button onClick={() => router.push("/registro")} style={btn}>Registrarme gratis</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column" }}>

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

      <div style={{ padding: "0 20px 24px", display: "flex", gap: 6 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? "#2563EB" : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>

      <div style={{ flex: 1, paddingLeft: "20px", paddingRight: "20px", paddingTop: 0, paddingBottom: 160, overflowY: "auto" }}>

        {step === 1 && (
          <div>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                { id: "gratis", label: "60 seg", precio: "Incluido", color: "#22C55E" },
                { id: "v120", label: "120 seg", precio: "USD 1", color: "#60A5FA" },
                { id: "v180", label: "180 seg", precio: "USD 2", color: "#60A5FA" },
                { id: "v300", label: "300 seg", precio: "USD 4", color: "#60A5FA" },
              ].map((v) => (
                <button key={v.id + "-dur"} onClick={() => setPlanElegido(v.id)} style={{ ...card(planElegido === v.id), padding: "14px", textAlign: "center" as const, marginBottom: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "#fff" }}>{v.label}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: v.color, fontWeight: 700 }}>{v.precio}</p>
                </button>
              ))}
            </div>


          </div>
        )}

        {step === 2 && (
          <div style={{ paddingBottom: 120 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Graba la propiedad</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 16px" }}>
              Tenes {planElegido === "v120" ? "120" : planElegido === "v180" ? "180" : planElegido === "v300" ? "300" : "60"} segundos
            </p>
            <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 16, background: gpsOk ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${gpsOk ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gpsOk ? "#10B981" : "#EF4444"} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: gpsOk ? "#10B981" : "#EF4444" }}>ARRYSE: {gpsOk ? "Ubicacion capturada" : "Capturando ubicacion..."}</p>
                {gpsOk && <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{gpsLat?.toFixed(4)}, {gpsLng?.toFixed(4)}</p>}
              </div>
            </div>

            <input ref={videoRef} type="file" accept="video/*" capture="environment" onChange={handleVideo} style={{ display: "none" }} />

            {!videoPreview ? (
              <div onClick={() => videoRef.current?.click()} style={{ height: 260, borderRadius: 16, border: "2px dashed rgba(37,99,235,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(37,99,235,0.05)" }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.9L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginTop: 12 }}>Toca para grabar</p>
              </div>
            ) : (
              <div>
                <video src={videoPreview} style={{ width: "100%", borderRadius: 16, maxHeight: 300, objectFit: "cover", marginBottom: 12 }} controls />
                <button onClick={() => { setVideo(null); setVideoPreview(null) }} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: 15, cursor: "pointer", marginBottom: 12, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                  Volver a grabar
                </button>
                <button onClick={() => setStep(3)} style={btn}>Usar este video</button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Datos de la propiedad</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Se veran sobre el video en el feed</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>Titulo de la propiedad</p>
<input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Hermoso depto en Palermo" style={{ ...inp, marginBottom: 16 }} />

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
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describe brevemente la propiedad..." maxLength={150} style={{ ...inp, height: 80, resize: "none", marginBottom: 4 }} />
            <p style={{ textAlign: "right", color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "0 0 16px" }}>{descripcion.length}/150</p>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600 }}>WhatsApp de contacto</p>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Ej: 5491112345678" type="tel" style={{ ...inp, marginBottom: 20 }} />
            <button onClick={() => setStep(4)} style={btn}>Continuar</button>
          </div>
        )}

        {step === 4 && (
          <div>
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

        {step === 5 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Todo listo!</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Revisa los datos antes de publicar</p>

            {videoPreview && (
              <video src={videoPreview} style={{ width: "100%", borderRadius: 14, maxHeight: 200, objectFit: "cover", marginBottom: 16 }} />
            )}

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
              {[
                ["Operacion", operacion],
                ["Tipo", tipoPropiedad || "No especificado"],
                ["Precio", `${moneda} ${parseInt(precio).toLocaleString()}`],
                ["Ubicacion", `${barrio}, ${ciudad}`],
                ["Destacar", destacar === "sin" ? "No" : destacar === "24h" ? "24 horas" : "7 dias"],
                ["ARRYSE GPS", gpsOk ? "Verificado" : "No verificado"],
              ].map(([label, value], i, arr) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{label}</span>
                  <span style={{ color: label === "ARRYSE GPS" ? (gpsOk ? "#22C55E" : "#EF4444") : "#fff", fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
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
        <div style={{ position: "fixed", bottom: 80, left: 0, right: 0, padding: "12px 20px", background: "#0a0a0a", zIndex: 99 }}>
          <button onClick={() => setStep(2)} style={btn}>Continuar</button>
        </div>
      )}
    </div>
  )
}
