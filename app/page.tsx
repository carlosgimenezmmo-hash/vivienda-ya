"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const apps = [
  { nombre: "ViviendaYa", descripcion: "Compra, alquila y vende propiedades con videos reales", color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", emoji: "🏠", href: "/feed", disponible: true },
  { nombre: "RodadosYa", descripcion: "Compra y vende autos, motos y vehiculos", color: "#3B82F6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", emoji: "🚗", href: "#", disponible: false },
  { nombre: "CocinaYa", descripcion: "Recetas, productos y servicios gastronomicos", color: "#F97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", emoji: "🍳", href: "#", disponible: false },
]

const pasos = [
  { numero: "01", titulo: "Crea tu cuenta", descripcion: "Registro rapido con verificacion de identidad ARRYSE. Tu cuenta es unica en todo el ecosistema Yah.", icono: "👤" },
  { numero: "02", titulo: "Publica con video", descripcion: "Graba o sube un video de lo que queres vender o alquilar. La ubicacion se verifica automaticamente por GPS.", icono: "🎥" },
  { numero: "03", titulo: "Conecta y vende", descripcion: "Los interesados te contactan directo por WhatsApp. Sin intermediarios, sin comisiones ocultas.", icono: "💬" },
]

const planes = [
  { nombre: "Gratis", precio: "0", periodo: "", color: "#6B7280", features: ["3 videos por mes", "Chat con interesados", "Verificacion ARRYSE gratis"] },
  { nombre: "Starter", precio: "10", periodo: "/mes", color: "#22C55E", features: ["Canal propio", "15 videos por mes", "Badge verificado"] },
  { nombre: "Pro", precio: "25", periodo: "/mes", color: "#2563EB", features: ["Todo Starter", "50 videos por mes", "5 destacados por mes"] },
  { nombre: "Elite", precio: "40", periodo: "/mes", color: "#D97706", features: ["Todo Pro", "100 videos por mes", "Prioridad absoluta"] },
]

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  const [showInstall, setShowInstall] = useState(false)
  const [os, setOs] = useState("desktop")

  useEffect(() => {
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) setOs("ios")
    else if (/Android/.test(ua)) setOs("android")
    else setOs("desktop")
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div style={{ background: "#fff", color: "#0a0a0a", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", overflowX: "hidden" }}>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(255,255,255,0.95)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "none", transition: "all 0.3s" }}>
        <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Yah<span style={{ color: "#22C55E" }}>!</span></span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => router.push("/registro")} style={{ padding: "8px 18px", borderRadius: 20, border: "1px solid rgba(0,0,0,0.12)", background: "transparent", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Registrarse</button>
          <button onClick={() => router.push("/feed")} style={{ padding: "8px 18px", borderRadius: 20, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Entrar</button>
        </div>
      </nav>

      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", textAlign: "center", background: "linear-gradient(180deg, #f0fdf4 0%, #fff 60%)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: 32, fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
          Disponible ahora como PWA
        </div>
        <h1 style={{ fontSize: "clamp(40px, 8vw, 80px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, margin: "0 0 24px", maxWidth: 800 }}>
          El mercado de videos<br /><span style={{ color: "#22C55E" }}>mas grande de Argentina</span>
        </h1>
        <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "#6B7280", maxWidth: 560, margin: "0 0 40px", lineHeight: 1.6 }}>
          Publica, busca y conecta con propiedades reales usando video. Sin fotos trucadas, sin intermediarios.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 60 }}>
          <button onClick={() => router.push("/registro")} style={{ padding: "16px 32px", borderRadius: 14, border: "none", background: "#22C55E", color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 24px rgba(34,197,94,0.35)" }}>Empezar gratis</button>
          <button onClick={() => router.push("/feed")} style={{ padding: "16px 32px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.12)", background: "#fff", color: "#0a0a0a", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Ver propiedades</button>
          <button onClick={() => setShowInstall(true)} style={{ padding: "16px 32px", borderRadius: 14, border: "1px solid rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.06)", color: "#16a34a", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Instalar app
          </button>
        </div>
        <div style={{ width: 260, height: 520, borderRadius: 36, background: "#0a0a0a", boxShadow: "0 32px 80px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden", border: "6px solid #1a1a1a" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #111 0%, #000 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: 20 }}>
            <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>Vivienda<span style={{ color: "#22C55E" }}>Ya</span></span>
              <span style={{ background: "rgba(245,158,11,0.9)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>DESTACADO</span>
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderLeft: "16px solid #fff", marginLeft: 3 }} />
            </div>
            <div style={{ width: "100%", marginBottom: 12 }}>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 22, margin: "0 0 4px", letterSpacing: -0.5 }}>USD 85.000</p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 4px" }}>Palermo, Buenos Aires</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "0 0 12px" }}>3 amb. | 75 m2</p>
              <div style={{ width: "100%", height: 48, background: "#25D366", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Contactar por WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 12px" }}>Como funciona</h2>
            <p style={{ color: "#6B7280", fontSize: 17, margin: 0 }}>Tres pasos y estas publicando</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {pasos.map((paso) => (
              <div key={paso.numero} style={{ padding: 32, borderRadius: 20, border: "1px solid rgba(0,0,0,0.08)", background: "#fafafa" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{paso.icono}</div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#22C55E", letterSpacing: 1 }}>{paso.numero}</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 12px", letterSpacing: -0.3 }}>{paso.titulo}</h3>
                <p style={{ color: "#6B7280", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{paso.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", background: "#f9fafb" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 12px" }}>Planes simples</h2>
            <p style={{ color: "#6B7280", fontSize: 17, margin: 0 }}>Sin sorpresas. Paga solo lo que necesitas.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {planes.map((plan) => (
              <div key={plan.nombre} style={{ padding: 24, borderRadius: 20, border: "2px solid rgba(0,0,0,0.06)", background: "#fff", display: "flex", flexDirection: "column" }}>
                <span style={{ background: plan.color, color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 800, alignSelf: "flex-start", marginBottom: 16 }}>{plan.nombre}</span>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>{plan.precio === "0" ? "Gratis" : `USD ${plan.precio}`}</span>
                  {plan.periodo && <span style={{ fontSize: 14, color: "#9CA3AF", marginLeft: 4 }}>{plan.periodo}</span>}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: plan.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span style={{ fontSize: 13, color: "#374151" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => router.push(plan.precio === "0" ? "/registro" : "/planes")} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: plan.color, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {plan.precio === "0" ? "Empezar gratis" : "Contratar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 12px" }}>El ecosistema <span style={{ color: "#22C55E" }}>Yah!</span></h2>
            <p style={{ color: "#6B7280", fontSize: 17, margin: 0 }}>Una cuenta. Todas las apps.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {apps.map((app) => (
              <div key={app.nombre} onClick={() => app.disponible && router.push(app.href)} style={{ padding: 28, borderRadius: 20, border: `1px solid ${app.border}`, background: app.bg, cursor: app.disponible ? "pointer" : "default", position: "relative", opacity: app.disponible ? 1 : 0.6 }}>
                {!app.disponible && (
                  <span style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.08)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#6B7280" }}>Proximamente</span>
                )}
                <div style={{ fontSize: 36, marginBottom: 12 }}>{app.emoji}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: app.color }}>{app.nombre}</h3>
                <p style={{ color: "#6B7280", fontSize: 14, margin: 0, lineHeight: 1.5 }}>{app.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, letterSpacing: -1, color: "#fff", margin: "0 0 16px" }}>Empieza hoy, es gratis</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 17, margin: "0 0 40px" }}>Instala ViviendaYa en tu celular y publica tu primera propiedad en minutos.</p>
        <button onClick={() => router.push("/registro")} style={{ padding: "18px 40px", borderRadius: 14, border: "none", background: "#22C55E", color: "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 24px rgba(34,197,94,0.4)" }}>Crear cuenta gratis</button>
      </section>
      {showInstall && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.5)" }} onClick={() => setShowInstall(false)}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "28px 24px 48px", width: "100%", maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.1)", margin: "0 auto 24px" }} />
            <h3 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px", textAlign: "center" }}>Instalar ViviendaYa</h3>
            <p style={{ color: "#6B7280", fontSize: 15, textAlign: "center", margin: "0 0 28px" }}>Agrega la app a tu pantalla de inicio, sin pasar por ninguna tienda.</p>
            {os === "ios" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[{paso:"1",texto:'Toca el boton compartir',icono:"📤"},{paso:"2",texto:'Selecciona "Agregar a pantalla de inicio"',icono:"➕"},{paso:"3",texto:'Toca "Agregar" arriba a la derecha',icono:"✅"}].map(p => (
                  <div key={p.paso} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "#f9fafb", borderRadius: 14 }}>
                    <span style={{ fontSize: 24 }}>{p.icono}</span>
                    <div><span style={{ fontSize: 11, fontWeight: 800, color: "#22C55E" }}>PASO {p.paso}</span><p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{p.texto}</p></div>
                  </div>
                ))}
              </div>
            )}
            {os === "android" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[{paso:"1",texto:"Toca los tres puntos arriba a la derecha",icono:"⋮"},{paso:"2",texto:'Selecciona "Agregar a pantalla de inicio"',icono:"➕"},{paso:"3",texto:'Toca "Agregar" para confirmar',icono:"✅"}].map(p => (
                  <div key={p.paso} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "#f9fafb", borderRadius: 14 }}>
                    <span style={{ fontSize: 24 }}>{p.icono}</span>
                    <div><span style={{ fontSize: 11, fontWeight: 800, color: "#22C55E" }}>PASO {p.paso}</span><p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{p.texto}</p></div>
                  </div>
                ))}
              </div>
            )}
            {os === "desktop" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[{paso:"1",texto:"Abre esta pagina en Chrome en tu celular",icono:"📱"},{paso:"2",texto:"Toca el menu del navegador",icono:"☰"},{paso:"3",texto:'Selecciona "Agregar a pantalla de inicio"',icono:"✅"}].map(p => (
                  <div key={p.paso} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "#f9fafb", borderRadius: 14 }}>
                    <span style={{ fontSize: 24 }}>{p.icono}</span>
                    <div><span style={{ fontSize: 11, fontWeight: 800, color: "#22C55E" }}>PASO {p.paso}</span><p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{p.texto}</p></div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowInstall(false)} style={{ width: "100%", marginTop: 24, padding: "16px", borderRadius: 14, border: "none", background: "#22C55E", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Entendido</button>
          </div>
        </div>
      )}

      <footer style={{ padding: "40px 24px", background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Yah<span style={{ color: "#22C55E" }}>!</span></span>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <span onClick={() => router.push("/feed")} style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer" }}>ViviendaYa</span>
            <span onClick={() => router.push("/planes")} style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer" }}>Planes</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Tres Arroyos, Buenos Aires</span>
          </div>
        </div>
      </footer>

    </div>
  )
}



