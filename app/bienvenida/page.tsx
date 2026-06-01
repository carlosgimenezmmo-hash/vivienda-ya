"use client"
import { useState, useRef } from "react"
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
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const handleSkip = () => {
    localStorage.setItem("onboarding_done", "1")
    router.push("/feed")
  }

  const handleEmpezar = () => {
    localStorage.setItem("onboarding_done", "1")
    router.push("/registro")
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50 && step < slides.length - 1) setStep(step + 1)
    if (diff < -50 && step > 0) setStep(step - 1)
  }

  const slide = slides[step]
  const isLast = step === slides.length - 1

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: "100dvh",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "52px 32px 180px",
        boxSizing: "border-box",
        userSelect: "none",
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
          width: 110, height: 110, borderRadius: "50%",
          background: `${slide.color}20`,
          border: `2px solid ${slide.color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 52, marginBottom: 28,
          transition: "all 0.3s ease",
        }}>
          {slide.emoji}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 14px", lineHeight: 1.2 }}>
          {slide.titulo}
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: "0 0 32px", maxWidth: 300 }}>
          {slide.descripcion}
        </p>

        {/* DOTS */}
        <div style={{ display: "flex", gap: 8 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i === step ? slide.color : "rgba(255,255,255,0.15)",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }} />
          ))}
        </div>
      </div>

      {/* HINT SWIPE o BOTON EMPEZAR */}
      {isLast ? (
        <button onClick={handleEmpezar} style={{
          width: "100%", padding: "18px", borderRadius: 16, border: "none",
          background: `linear-gradient(135deg, ${slide.color}, ${slide.color}cc)`,
          color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          ¡Empezar!
        </button>
      ) : (
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, margin: 0 }}>
          Deslizá para continuar →
        </p>
      )}

    </div>
  )
}