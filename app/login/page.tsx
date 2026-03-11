"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Completá todos los campos")
      return
    }
    setLoading(true)
    setError("")

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError("Email o contraseña incorrectos")
      setLoading(false)
      return
    }

    login()
    router.push("/")
  }

  return (
    <div style={{
      minHeight: "100dvh", background: "#0a0a0a", color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "0 24px",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>
          Vivienda<span style={{ color: "#22C55E" }}>Ya</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 6 }}>
          Bienvenido de vuelta
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 380,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20, padding: "28px 24px",
      }}>
        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 16,
            color: "#FCA5A5", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Botón */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: loading ? "rgba(37,99,235,0.5)" : "linear-gradient(135deg, #2563EB, #1d4ed8)",
            color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {loading ? "Ingresando..." : "Ingresar →"}
        </button>

        {/* Link olvidé contraseña */}
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
          ¿Olvidaste tu contraseña?{" "}
          <span style={{ color: "#2563EB", cursor: "pointer" }}>
            Recuperar
          </span>
        </p>
      </div>

      {/* Registro */}
      <p style={{ marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
        ¿No tenés cuenta?{" "}
        <span
          onClick={() => router.push("/registro")}
          style={{ color: "#22C55E", fontWeight: 600, cursor: "pointer" }}
        >
          Registrate gratis
        </span>
      </p>
    </div>
  )
}