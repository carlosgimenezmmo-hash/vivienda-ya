"use client"

import { useEffect, useState } from "react"

interface Punto {
  nombre: string
  categoria: string
  icono: string
  distancia: number
}

export default function PuntosDeInteres({ lat, lng }: { lat: number; lng: number }) {
  const [puntos, setPuntos] = useState<Punto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function fetchPuntos() {
      try {
        const res = await fetch(`/api/puntos-interes?lat=${lat}&lng=${lng}&radio=1000`)
        const data = await res.json()
        if (!cancelado) {
          if (data.error) {
            setError(true)
          } else {
            setPuntos(data.puntos || [])
          }
        }
      } catch {
        if (!cancelado) setError(true)
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    fetchPuntos()
    return () => { cancelado = true }
  }, [lat, lng])

  if (loading) {
    return (
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Qué hay cerca
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Buscando puntos de interés...</p>
      </div>
    )
  }

  // Si falla o no hay resultados, no mostramos nada (no molesta al usuario con un error técnico)
  if (error || !puntos || puntos.length === 0) return null

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Qué hay cerca
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {puntos.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{p.icono}</span>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{p.nombre}</span>
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {p.distancia < 1000 ? `${p.distancia} m` : `${(p.distancia / 1000).toFixed(1)} km`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}