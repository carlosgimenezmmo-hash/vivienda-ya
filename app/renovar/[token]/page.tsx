"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"

interface PropertyPreview {
  id: string
  title: string
  status: string
  isExpired: boolean
}

export const dynamic = 'force-dynamic';

export default function RenovarPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = params.token as string
  const action = searchParams?.get("action") as "confirm" | "done" | null

  const [property, setProperty] = useState<PropertyPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError("Token no válido")
      setLoading(false)
      return
    }

    fetchPropertyInfo()

    // Si viene desde el email con action, procesar automáticamente
    if (action === "confirm" || action === "done") {
      setTimeout(() => {
        handleAction(action === "confirm" ? "confirmar" : "finalizar")
      }, 500)
    }
  }, [token, action])

  const fetchPropertyInfo = async () => {
    try {
      const response = await fetch(`/api/renovar?token=${token}`)

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Token inválido o expirado")
        setLoading(false)
        return
      }

      const data = await response.json()
      setProperty(data.property)

      if (data.isExpired) {
        setError("El link de renovación ha expirado (máximo 24 horas)")
      }

      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleAction = async (actionType: "confirmar" | "finalizar") => {
    setProcessing(true)
    try {
      const res = await fetch("/api/renovar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: actionType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al procesar")

      setResultado(
        actionType === "confirmar"
          ? "¡Listo! Confirmamos que tu propiedad sigue disponible."
          : "Listo, marcamos tu propiedad como vendida/alquilada. Ya no aparece en ViviendaYa."
      )

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Ocurrió un error, intentá de nuevo.")
    } finally {
      setProcessing(false)
    }
  }

  const wrapperStyle: React.CSSProperties = {
    minHeight: "100dvh",
    background: "#0a0a0a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    textAlign: "center",
  }

  if (loading) {
    return <div style={wrapperStyle}><p>Cargando...</p></div>
  }

  if (error && !resultado) {
    return (
      <div style={wrapperStyle}>
        <p style={{ color: "#EF4444", fontSize: 16 }}>{error}</p>
      </div>
    )
  }

  if (resultado) {
    return (
      <div style={wrapperStyle}>
        <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Vivienda<span style={{ color: "#22C55E" }}>Ya</span>
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)" }}>{resultado}</p>
      </div>
    )
  }

  return (
    <div style={wrapperStyle}>
      <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        Vivienda<span style={{ color: "#22C55E" }}>Ya</span>
      </p>

      {property?.video_url && (
        <video
          src={property.video_url}
          style={{ width: "100%", maxWidth: 320, borderRadius: 16, marginBottom: 16 }}
          muted
          playsInline
        />
      )}

      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        {property?.title}
      </h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
        ¿Tu propiedad sigue disponible?
      </p>

      <button
        onClick={() => handleAction("confirmar")}
        disabled={processing}
        style={{
          width: "100%",
          maxWidth: 320,
          padding: 16,
          borderRadius: 14,
          border: "none",
          background: "#22C55E",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 12,
          opacity: processing ? 0.6 : 1,
        }}
      >
        Sigue disponible
      </button>

      <button
        onClick={() => handleAction("finalizar")}
        disabled={processing}
        style={{
          width: "100%",
          maxWidth: 320,
          padding: 16,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "transparent",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          opacity: processing ? 0.6 : 1,
        }}
      >
        Ya se vendió / alquiló
      </button>
    </div>
  )
}