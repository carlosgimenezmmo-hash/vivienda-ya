"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function RegistroPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogle = async () => {
    setLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://vivienda-ya.vercel.app/auth/handler",
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google")
      setLoading(false)
    }
  }

  const handleFacebook = async () => {
    setLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: "https://vivienda-ya.vercel.app/auth/handler",
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Facebook")
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100dvh", background: "#0a0a0a", color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "0 24px",
    }}>
      <p style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>
        Vivienda<span style={{ color: "#22C55E" }}>Ya</span>
      </p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: "0 0 48px", textAlign: "center" }}>
        Compra, alquilá y vendé propiedades con videos reales
      </p>

      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14 }}>

        <button onClick={handleGoogle} disabled={loading} style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)",
          background: "#fff", color: "#000", fontSize: 16, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          opacity: loading ? 0.7 : 1,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Redirigiendo..." : "Continuar con Google"}
        </button>

        <button onClick={handleFacebook} disabled={loading} style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)",
          background: "#1877F2", color: "#fff", fontSize: 16, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          opacity: loading ? 0.7 : 1,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {loading ? "Redirigiendo..." : "Continuar con Facebook"}
        </button>

      </div>

      {error && (
        <p style={{ color: "#EF4444", fontSize: 13, marginTop: 16, textAlign: "center" }}>{error}</p>
      )}

      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 48, textAlign: "center", lineHeight: 1.6 }}>
        Al continuar aceptás los Términos y Condiciones de ViviendaYa
      </p>
    </div>
  )
}