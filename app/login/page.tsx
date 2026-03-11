"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    setError("")
    if (!email || !password) return setError("Completá todos los campos")
    setLoading(true)
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) throw loginError
      router.push('/')
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#0a0a0a', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* HEADER */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => router.back()}
          style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
          Vivienda<span style={{ color: '#22C55E' }}>Ya</span>
        </span>
      </div>

      <div style={{ flex: 1, padding: '20px 20px 48px' }}>
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(37,99,235,0.15)', border: '2px solid rgba(37,99,235,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.5 }}>Bienvenido de vuelta</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>Ingresá a tu cuenta</p>
        </div>

        {/* FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" type="email" style={inp} />
          <input value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña" type="password" style={inp}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <span onClick={() => router.push('/recuperar')}
            style={{ color: '#22C55E', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            ¿Olvidaste tu contraseña?
          </span>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginTop: 14 }}>
            <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', padding: '16px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
          color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
          marginTop: 24, opacity: loading ? 0.7 : 1,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          {loading ? 'Ingresando...' : 'Ingresar →'}
        </button>

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>o</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <button onClick={() => router.push('/registro')} style={{
          width: '100%', padding: '15px', borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600,
          cursor: 'pointer',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          Crear cuenta nueva
        </button>
      </div>
    </div>
  )
}