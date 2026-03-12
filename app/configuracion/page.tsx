"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"

type Section = null | 'password' | 'email' | 'privacy' | 'baja'

export default function ConfiguracionPage() {
  const { user, isLoggedIn, logout } = useAuth()
  const router = useRouter()

  const [section, setSection] = useState<Section>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Cambiar contraseña
  const [currentPass, setCurrentPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")

  // Cambiar email
  const [newEmail, setNewEmail] = useState("")

  // Baja
  const [confirmBaja, setConfirmBaja] = useState("")

  const reset = () => {
    setError(""); setSuccess("")
    setCurrentPass(""); setNewPass(""); setConfirmPass("")
    setNewEmail(""); setConfirmBaja("")
  }

  const handleChangePassword = async () => {
    setError(""); setSuccess("")
    if (!newPass || !confirmPass) return setError("Completá todos los campos")
    if (newPass.length < 6) return setError("La contraseña debe tener al menos 6 caracteres")
    if (newPass !== confirmPass) return setError("Las contraseñas no coinciden")
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      setSuccess("Contraseña actualizada correctamente")
      setNewPass(""); setConfirmPass("")
    } catch (err: any) {
      setError(err.message || "Error al cambiar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  const handleChangeEmail = async () => {
    setError(""); setSuccess("")
    if (!newEmail) return setError("Ingresá el nuevo email")
    if (!newEmail.includes("@")) return setError("Email inválido")
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      setSuccess("Te enviamos un email de confirmación a " + newEmail)
      setNewEmail("")
    } catch (err: any) {
      setError(err.message || "Error al cambiar el email")
    } finally {
      setLoading(false)
    }
  }

  const handleBaja = async () => {
    setError("")
    if (confirmBaja !== "CONFIRMAR") return setError('Escribí CONFIRMAR para continuar')
    setLoading(true)
    try {
      // Marcar usuario como dado de baja en la tabla users
      await supabase.from('users').update({ active: false }).eq('id', user?.id)
      await supabase.auth.signOut()
      await logout()
      router.push('/')
    } catch (err: any) {
      setError(err.message || "Error al dar de baja la cuenta")
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn || !user) {
    router.push('/login')
    return null
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  }

  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '15px', borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    marginTop: 8,
  }

  // ── SUBSECCIONES ──────────────────────────────────────────────────────────

  if (section === 'password') return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => { setSection(null); reset() }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Cambiar contraseña</h1>
      </div>
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Nueva contraseña" type="password" style={inp} />
        <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repetir nueva contraseña" type="password" style={inp} />
        {error && <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{error}</p>}
        {success && <p style={{ color: '#22C55E', fontSize: 13, margin: 0 }}>{success}</p>}
        <button onClick={handleChangePassword} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : 'Actualizar contraseña'}
        </button>
      </div>
    </div>
  )

  if (section === 'email') return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => { setSection(null); reset() }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Cambiar email</h1>
      </div>
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Email actual</p>
          <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600 }}>{user.email}</p>
        </div>
        <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Nuevo email" type="email" style={inp} />
        {error && <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{error}</p>}
        {success && <p style={{ color: '#22C55E', fontSize: 13, margin: 0 }}>{success}</p>}
        <button onClick={handleChangeEmail} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Enviando...' : 'Cambiar email'}
        </button>
      </div>
    </div>
  )

  if (section === 'privacy') return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => setSection(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Privacidad y datos</h1>
      </div>
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { title: '¿Qué datos guardamos?', body: 'Guardamos tu nombre, email, DNI, teléfono y las propiedades que publicás. Nunca vendemos tus datos a terceros.' },
          { title: '¿Para qué usamos tu DNI?', body: 'Solo para verificar tu identidad y cumplir con la Ley 25.326. Tu DNI no es visible para otros usuarios.' },
          { title: 'Derecho de acceso y rectificación', body: 'Podés solicitar acceso, rectificación o eliminación de tus datos escribiendo a protecciondedatos@viviendaya.com. Plazo de respuesta: 10 días hábiles.' },
          { title: 'Retención de datos', body: 'Tus datos se conservan mientras tu cuenta esté activa y hasta 2 años después de darte de baja, según la ley argentina.' },
          { title: 'Contacto', body: 'Para consultas sobre privacidad: privacidad@viviendaya.com' },
        ].map(item => (
          <div key={item.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 14 }}>{item.title}</p>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )

  if (section === 'baja') return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => { setSection(null); reset() }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Dar de baja mi cuenta</h1>
      </div>
      <div style={{ padding: '24px 20px' }}>
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '16px', marginBottom: 24 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 15, color: '#FCA5A5' }}>⚠️ Esta acción es irreversible</p>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Se eliminarán tus publicaciones activas, créditos y acceso a la plataforma. Tus datos se conservan 2 años según la Ley 25.326.
          </p>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
          Para confirmar, escribí <strong style={{ color: '#fff' }}>CONFIRMAR</strong> en el campo de abajo:
        </p>
        <input
          value={confirmBaja}
          onChange={e => setConfirmBaja(e.target.value)}
          placeholder="CONFIRMAR"
          style={{ ...inp, marginBottom: 12 }}
        />
        {error && <p style={{ color: '#EF4444', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
        <button
          onClick={handleBaja}
          disabled={loading || confirmBaja !== 'CONFIRMAR'}
          style={{
            width: '100%', padding: '15px', borderRadius: 14,
            background: confirmBaja === 'CONFIRMAR' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${confirmBaja === 'CONFIRMAR' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: confirmBaja === 'CONFIRMAR' ? '#FCA5A5' : 'rgba(255,255,255,0.3)',
            fontSize: 15, fontWeight: 700, cursor: confirmBaja === 'CONFIRMAR' ? 'pointer' : 'not-allowed',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Procesando...' : 'Dar de baja mi cuenta'}
        </button>
      </div>
    </div>
  )

  // ── PANTALLA PRINCIPAL ────────────────────────────────────────────────────
  const items = [
    { emoji: '🔑', label: 'Cambiar contraseña', sub: 'Actualizá tu contraseña de acceso', section: 'password' as Section },
    { emoji: '✉️', label: 'Cambiar email', sub: user.email, section: 'email' as Section },
    { emoji: '🔒', label: 'Privacidad y datos', sub: 'Cómo usamos tu información', section: 'privacy' as Section },
    { emoji: '🗑️', label: 'Dar de baja mi cuenta', sub: 'Eliminar cuenta permanentemente', section: 'baja' as Section, danger: true },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', paddingBottom: 90 }}>

      {/* HEADER */}
      <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => router.push('/perfil')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Configuración</h1>
      </div>

      {/* USUARIO */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
          {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{user.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
        </div>
      </div>

      {/* MENÚ */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div
              key={item.label}
              onClick={() => setSection(item.section)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer',
                borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: item.danger ? 'rgba(239,68,68,0.03)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: item.danger ? '#FCA5A5' : '#fff' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{item.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* VERSION */}
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12, marginTop: 32 }}>
        Vivienda Ya v1.0
      </p>
    </div>
  )
}
