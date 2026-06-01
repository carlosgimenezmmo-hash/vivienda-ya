"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const slides = [
  {
    emoji: "🏠",
    titulo: "Bienvenido a ViviendaYa",
    descripcion: "El primer marketplace inmobiliario en video de Argentina. Encontrá tu próxima propiedad en segundos.",
    color: "#2563EB",
  },
  {
    emoji: "📱",
    titulo: "Publicá en segundos",
    descripcion: "Grabá un video de tu propiedad con el celular y publicala al instante. Sin formularios largos, sin esperas.",
    color: "#7C3AED",
  },
  {
    emoji: "🏕️",
    titulo: "Hoteles, campings y más",
    descripcion: "Reservá alojamientos temporarios, hoteles y campings con fechas y pago seguro.",
    color: "#059669",
  },
  {
    emoji: "✅",
    titulo: "Propiedades verificadas",
    descripcion: "El GPS confirma que el video fue grabado en el lugar. Más confianza, menos sorpresas.",
    color: "#D97706",
  },
]

export default function BienvenidaPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1)
    } else {
      localStorage.setItem("onboarding_done", "1")
      router.push("/registro")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("onboarding_done", "1")
    router.push("/feed")
  }

  const slide = slides[step]

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "40px 32px 32px",
    }}>

      {/* SKIP */}
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSkip} style={{
          background: "transparent", border: "none",
          color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          Saltar
        </button>
      </div>

      {/* CONTENIDO */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: `${slide.color}20`,
          border: `2px solid ${slide.color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 56, marginBottom: 24,
        }}>
          {slide.emoji}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 16px", lineHeight: 1.2 }}>
          {slide.titulo}
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0, maxWidth: 320 }}>
          {slide.descripcion}
        </p>
      </div>

      {/* DOTS + BOTON */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, paddingBottom: 80 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i === step ? slide.color : "rgba(255,255,255,0.15)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        <button onClick={handleNext} style={{
          width: "100%", padding: "18px", borderRadius: 16, border: "none",
          background: `linear-gradient(135deg, ${slide.color}, ${slide.color}cc)`,
          color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          {step < slides.length - 1 ? "Siguiente" : "¡Empezar!"}
        </button>
      </div>

    </div>
  )
}