"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

function sanitizeText(value: string, maxLength = 200): string {
  return value.replace(/<[^>]*>/g, "").replace(/[<>'"]/g, "").trim().slice(0, maxLength)
}

function sanitizeNumber(value: string, max = 999999999): number {
  const num = parseFloat(value.replace(/[^0-9.]/g, ""))
  if (isNaN(num) || num < 0) return 0
  return Math.min(num, max)
}

function sanitizePhone(value: string): string {
  return value.replace(/[^0-9+]/g, "").slice(0, 20)
}

export default function PublicarPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 3
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [gpsLat, setGpsLat] = useState<number | null>(null)
  const [gpsLng, setGpsLng] = useState<number | null>(null)
  const [gpsOk, setGpsOk] = useState(false)
  const videoRef = useRef<HTMLInputElement>(null)
  const galeriaRef = useRef<HTMLInputElement>(null)
  const [operacion, setOperacion] = useState("venta")
  const [tipoPropiedad, setTipoPropiedad] = useState("")
  const [precio, setPrecio] = useState("")
  const [moneda, setMoneda] = useState("ARS")
  const [ambientes, setAmbientes] = useState("")
  const [superficie, setSuperficie] = useState("")
  const [tipoHabitacion, setTipoHabitacion] = useState<string[]>([])
  const [subtype, setSubtype] = useState("")
  const [huespedes, setHuespedes] = useState("")
  const [hotelName, setHotelName] = useState("")
  const [stars, setStars] = useState(0)
  const [hotelServices, setHotelServices] = useState<string[]>([])
  const [barrio, setBarrio] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [provincia, setProvincia] = useState("")
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [videoDesdeGaleria, setVideoDesdeGaleria] = useState(false)
  const [planActual, setPlanActual] = useState("gratis")

  // AGREGADO 2 — Carga el plan del usuario
  useEffect(() => {
    const cargarPlan = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id
      if (!uid) return
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", uid)
        .eq("estado", "activo")
        .maybeSingle()
      if (sub?.plan) setPlanActual(sub.plan)
    }
    cargarPlan()
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setGpsLat(pos.coords.latitude); setGpsLng(pos.coords.longitude); setGpsOk(true) },
        () => setGpsOk(false)
      )
    }
  }, [])

  // AGREGADO 3 — Límite de segundos según plan
  const getLimiteSegundos = (plan: string): number => {
    switch (plan) {
      case "junior":        return 120
      case "agente":        return 180
      case "especializado": return 300
      case "senior":        return 300
      default:              return 60
    }
  }

  // AGREGADO 4 — Validación de duración del video
  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>, desdeGaleria = false) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const videoEl = document.createElement("video")
    videoEl.preload = "metadata"
    videoEl.src = url
    videoEl.onloadedmetadata = () => {
      const duracion = videoEl.duration
      const limite = getLimiteSegundos(planActual)
      const minutos = Math.floor(limite / 60)
      const segundos = limite % 60
      const limiteTexto = segundos === 0 ? `${minutos} minuto${minutos > 1 ? "s" : ""}` : `${limite} segundos`
      if (duracion > limite) {
        URL.revokeObjectURL(url)
        setError(`Tu plan ${planActual === "gratis" ? "gratuito" : planActual} permite videos de hasta ${limiteTexto}. Este video dura ${Math.round(duracion)} segundos. Editalo o elegí uno más corto.`)
        return
      }
      setError("")
      setVideoDesdeGaleria(desdeGaleria)
      setVideo(file)
      setVideoPreview(url)
    }
    videoEl.onerror = () => {
      URL.revokeObjectURL(url)
      setError("No se pudo leer el video. Probá con otro archivo.")
    }
  }

  const handlePublicar = async () => {
    setLoading(true)
    setError("")
    try {
      const tituloClean = sanitizeText(titulo, 100)
      const descripcionClean = sanitizeText(descripcion, 150)
      const barrioClean = sanitizeText(barrio, 80)
      const ciudadClean = sanitizeText(ciudad, 80)
      const whatsappClean = sanitizePhone(whatsapp)
      const precioClean = sanitizeNumber(precio, 99999999)
      const ambientesClean = sanitizeNumber(ambientes, 50)
      const superficieClean = sanitizeNumber(superficie, 99999)

      if (!tituloClean) throw new Error("El título no puede estar vacío")
      if (!ciudadClean) throw new Error("La ciudad no puede estar vacía")
      if (whatsappClean && whatsappClean.length < 8) throw new Error("El número de WhatsApp no es válido")

      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData?.session?.user?.id
      if (!uid) throw new Error("Sesión expirada. Volvé a iniciar sesión.")
      if (!video) throw new Error("Debes seleccionar un video")

      let videoUrl = ""
      const ext = video.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('videos-app').upload(path, video, { contentType: video.type })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('videos-app').getPublicUrl(path)
      videoUrl = data.publicUrl

      const { error: insertError } = await supabase.from("properties").insert({
        user_id: uid,
        owner_name: user?.name || "Propietario",
        owner_avatar: user?.avatar_url || null,
        operation_type: operacion,
        property_type: operacion !== "hotel" && operacion !== "camping" ? tipoPropiedad : null,
        price: operacion !== "hotel" && operacion !== "camping" ? precioClean : null,
        rooms: operacion !== "hotel" && operacion !== "camping" ? ambientesClean || null : null,
        room_type: (operacion === "hotel" || operacion === "camping") ? tipoHabitacion.join(",") : null,
        property_subtype: operacion === "temporario" ? subtype || null : null,
        max_guests: (operacion === "hotel" || operacion === "camping") ? parseInt(huespedes) || null : null,
        hotel_name: (operacion === "hotel" || operacion === "camping") ? hotelName || null : null,
        stars: operacion === "hotel" ? stars || null : null,
        hotel_services: (operacion === "hotel" || operacion === "camping") ? hotelServices : null,
        surface: operacion !== "hotel" && operacion !== "camping" ? superficieClean || null : null,
        neighborhood: barrioClean,
        city: ciudadClean,
        province: provincia || null,
        location: `${barrioClean}, ${ciudadClean}`,
        title: tituloClean,
        description: descripcionClean,
        whatsapp_number: whatsappClean,
        video_url: videoUrl,
        verified: gpsOk,
        lat: gpsLat,
        lng: gpsLng,
        highlighted: false,
        likes: 0,
        status: "approved"
      })
      if (insertError) throw insertError
      router.push("/feed")
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
  const chip = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px", borderRadius: 20,
    border: `1px solid ${active ? "#2563EB" : "rgba(255,255,255,0.12)"}`,
    background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
    color: active ? "#60A5FA" : "rgba(255,255,255,0.5)",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  })
  const sectionLabel: React.CSSProperties = {
    fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", fontWeight: 600,
  }

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
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>

      <div style={{ padding: "52px 20px 16px", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Publica tu propiedad</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginLeft: 10 }}>Paso {step}/{totalSteps}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? "#2563EB" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>

      <div style={{ padding: "8px 20px 200px", overflowY: "auto" }}>

        {/* PASO 1 — VIDEO */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>¿Qué querés publicar?</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 16px" }}>Elegí el tipo y grabá un video corto</p>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 16, background: gpsOk ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${gpsOk ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gpsOk ? "#10B981" : "#EF4444"} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: gpsOk ? "#10B981" : "#EF4444" }}>
                  GPS: {gpsOk ? "Ubicacion capturada" : "Capturando ubicacion..."}
                </p>
                {gpsOk && <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{gpsLat?.toFixed(4)}, {gpsLng?.toFixed(4)}</p>}
              </div>
            </div>

            <input ref={videoRef} type="file" accept="video/*" capture="environment" onChange={(e) => handleVideo(e, false)} style={{ display: "none" }} />
            <input ref={galeriaRef} type="file" accept="video/*" onChange={(e) => handleVideo(e, true)} style={{ display: "none" }} />

            {!videoPreview ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div onClick={() => videoRef.current?.click()} style={{ height: 200, borderRadius: 16, border: "2px dashed rgba(37,99,235,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(37,99,235,0.05)" }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.9L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginTop: 10, fontWeight: 600 }}>Grabar con camara</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>Video verificado con GPS</p>
                </div>
                <div onClick={() => galeriaRef.current?.click()} style={{ height: 120, borderRadius: 16, border: "2px dashed rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(255,255,255,0.03)" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8, fontWeight: 600 }}>Subir desde galeria</p>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 2 }}>Se mostrara como no verificado</p>
                </div>
              </div>
            ) : (
              <div>
                {videoDesdeGaleria && !gpsOk && (
                  <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#F59E0B", fontWeight: 600 }}>Este video se publicara como No verificado</p>
                  </div>
                )}
                <video src={videoPreview} style={{ width: "100%", borderRadius: 16, maxHeight: 300, objectFit: "cover", marginBottom: 12 }} controls />
                {!videoDesdeGaleria && (
                  <a
                    href={videoPreview}
                    download="video-viviendaya.mp4"
                    style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 10 }}
                  >
                    Descargar para editar
                  </a>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setVideo(null); setVideoPreview(null); setError("") }} style={{ padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                    Cambiar
                  </button>
                  <button onClick={() => setStep(2)} style={{ ...btn, flex: 1 }}>Usar este video</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 2 — DATOS */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Contanos los detalles</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Esta info aparece en tu publicación</p>

            <p style={sectionLabel}>Titulo</p>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} onBlur={e => setTitulo(sanitizeText(e.target.value, 100))} placeholder="Ej: Hermoso depto en Palermo" maxLength={100} style={{ ...inp, marginBottom: 16 }} />

            <p style={sectionLabel}>Tipo de operacion</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {[["venta", "Venta"], ["alquiler", "Alquiler"], ["temporario", "Temporario"], ["permuta", "Permuta"], ["hotel", "Hotel"], ["camping", "🏕️ Camping"]].map(([val, label]) => (
                <button key={val} onClick={() => setOperacion(val)} style={chip(operacion === val)}>{label}</button>
              ))}
            </div>

            {(operacion === "hotel" || operacion === "camping") && (
              <div style={{ marginBottom: 16 }}>
                <p style={sectionLabel}>{operacion === "camping" ? "Nombre del camping" : "Nombre del hotel"}</p>
                <input value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder={operacion === "camping" ? "Ej: Camping Los Arrayanes" : "Ej: Hotel Patagonia"} maxLength={100} style={{ ...inp, marginBottom: 12 }} />

                <p style={sectionLabel}>Estrellas</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setStars(n)} style={{ ...chip(stars === n), padding: "10px 14px" }}>{"⭐".repeat(n)}</button>
                  ))}
                </div>

                <p style={sectionLabel}>{operacion === "camping" ? "Tipo de lugar" : "Tipo de habitacion"}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 }}>
                  {(operacion === "camping"
                    ? [["parcela", "⛺ Parcela"], ["cabana", "🛖 Cabaña"], ["domo", "🔵 Domo"], ["glamping", "✨ Glamping"], ["motorhome", "🚐 Motorhome"]]
                    : [["simple", "🛏 Simple"], ["doble", "🛏🛏 Doble"], ["suite", "👑 Suite"], ["familiar", "👨‍👩‍👧 Familiar"]]
                  ).map(([val, label]) => (
                    <button key={val} onClick={() => setTipoHabitacion(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])} style={chip(tipoHabitacion.includes(val))}>{label}</button>
                  ))}
                </div>

                <p style={sectionLabel}>Huespedes maximos</p>
                <input value={huespedes} onChange={e => setHuespedes(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Ej: 2" type="number" inputMode="numeric" style={{ ...inp, marginBottom: 12 }} />

                <p style={sectionLabel}>{operacion === "camping" ? "Servicios del camping" : "Servicios del hotel"}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 }}>
                  {["🏊 Pileta", "🧖 Sauna", "🏋️ Gym", "🅿️ Estacionamiento", "📶 Wifi", "🍳 Desayuno", "🍽️ Restaurante", "🔑 Recepcion 24hs", "♿ Accesible", "🐾 Pet friendly", "❄️ Aire acondicionado", "🔥 Calefaccion"].map(s => (
                    <button key={s} onClick={() => setHotelServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={chip(hotelServices.includes(s))}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {operacion === "temporario" && (
              <div style={{ marginBottom: 16 }}>
                <p style={sectionLabel}>Subcategoria</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {[["casa", "🏠 Casa"], ["departamento", "🏢 Apart"], ["cabana", "🛖 Cabaña"], ["pension", "🏩 Pensión"]].map(([val, label]) => (
                    <button key={val} onClick={() => setSubtype(val)} style={chip(subtype === val)}>{label}</button>
                  ))}
                </div>
              </div>
            )}

            {operacion !== "hotel" && operacion !== "camping" && (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <p style={sectionLabel}>Ambientes</p>
                    <input value={ambientes} onChange={e => setAmbientes(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Ej: 3" type="number" inputMode="numeric" style={inp} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={sectionLabel}>Superficie m2</p>
                    <input value={superficie} onChange={e => setSuperficie(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Ej: 75" type="number" inputMode="numeric" style={inp} />
                  </div>
                </div>

                <p style={sectionLabel}>Precio</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button onClick={() => setMoneda("ARS")} style={{ ...chip(moneda === "ARS"), flexShrink: 0 }}>ARS</button>
                  <button onClick={() => setMoneda("USD")} style={{ ...chip(moneda === "USD"), flexShrink: 0 }}>USD</button>
                  <input value={precio} onChange={e => setPrecio(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Precio" type="number" inputMode="numeric" style={{ ...inp, flex: 1 }} />
                </div>

                <p style={sectionLabel}>Tipo de propiedad</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {["Departamento", "Casa", "PH", "Local", "Oficina", "Terreno", "Loft", "Monoambiente", "Cabana", "Duplex", "Cochera", "Galpon"].map(t => (
                    <button key={t} onClick={() => setTipoPropiedad(t)} style={chip(tipoPropiedad === t)}>{t}</button>
                  ))}
                </div>
              </>
            )}

            <p style={sectionLabel}>Ubicacion</p>
            <input value={provincia} onChange={e => setProvincia(e.target.value)} onBlur={e => setProvincia(sanitizeText(e.target.value, 80))} placeholder="Provincia" maxLength={80} style={{ ...inp, marginBottom: 10 }} />
            <input value={ciudad} onChange={e => setCiudad(e.target.value)} onBlur={e => setCiudad(sanitizeText(e.target.value, 80))} placeholder="Ciudad" maxLength={80} style={{ ...inp, marginBottom: 10 }} />
            <input value={barrio} onChange={e => setBarrio(e.target.value)} onBlur={e => setBarrio(sanitizeText(e.target.value, 80))} placeholder="Barrio" maxLength={80} style={{ ...inp, marginBottom: 16 }} />

            <p style={sectionLabel}>Descripcion corta</p>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} onBlur={e => setDescripcion(sanitizeText(e.target.value, 150))} placeholder="Describe brevemente la propiedad..." maxLength={150} style={{ ...inp, height: 80, resize: "none", marginBottom: 4 }} />
            <p style={{ textAlign: "right", color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "0 0 16px" }}>{descripcion.length}/150</p>

            <p style={sectionLabel}>WhatsApp de contacto</p>
            <input value={whatsapp} onChange={e => setWhatsapp(sanitizePhone(e.target.value))} placeholder="Ej: 5491112345678" type="tel" maxLength={20} style={{ ...inp, marginBottom: 20 }} />

            <button onClick={() => setStep(3)} style={btn}>Continuar</button>
          </div>
        )}

        {/* PASO 3 — CONFIRMAR */}
        {step === 3 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Revisá antes de publicar</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 20px" }}>Revisa los datos antes de publicar</p>

            {videoPreview && <video src={videoPreview} style={{ width: "100%", borderRadius: 14, maxHeight: 200, objectFit: "cover", marginBottom: 16 }} />}

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
              {[
                ["Operacion", operacion],
                ["Tipo", (operacion === "hotel" || operacion === "camping") ? (hotelName || operacion) : (tipoPropiedad || "No especificado")],
                ...((operacion !== "hotel" && operacion !== "camping") ? [["Precio", precio ? `${moneda} ${parseInt(precio).toLocaleString()}` : "No especificado"]] : []),
                ["Ubicacion", [barrio, ciudad].filter(Boolean).join(", ") || "No especificada"],
                ["GPS", gpsOk ? "Verificado" : "No verificado"],
              ].map(([label, value], i, arr) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{label}</span>
                  <span style={{ color: label === "GPS" ? (gpsOk ? "#22C55E" : "#EF4444") : "#fff", fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}><p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p></div>}

            <button onClick={handlePublicar} disabled={loading} style={{ ...btn, opacity: loading ? 0.6 : 1, marginTop: 8 }}>
              {loading ? "Publicando..." : "Publicar ahora"}
            </button>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center", marginTop: 12 }}>Al publicar aceptas los Terminos y Condiciones de ViviendaYa</p>
          </div>
        )}

      </div>
    </div>
  )
}