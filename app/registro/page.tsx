"use client"

import { useState, useRef, ChangeEvent } from "react"
import { createWorker } from "tesseract.js"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type Step = 1 | 2 | 3 | 4

const TYC_CONTENT = `TÉRMINOS Y CONDICIONES DE USO — VIVIENDA YA
Última actualización: marzo 2025

1. OBJETO Y ALCANCE DEL SERVICIO
Vivienda Ya es una plataforma digital que actúa como nexo e intermediario entre usuarios que desean publicar, buscar, comprar, vender, alquilar o permutar inmuebles en la República Argentina. VIVIENDA YA NO ES PROPIETARIA de ninguno de los inmuebles publicados, ni parte en las operaciones inmobiliarias que se concreten a través de la plataforma.

El uso de la plataforma está disponible para personas humanas mayores de 18 años y personas jurídicas debidamente constituidas en la República Argentina.

2. REGISTRO, IDENTIDAD Y CAPACIDAD LEGAL
Para operar en la plataforma es obligatorio:
- Ser mayor de 18 años.
- Registrarse con un DNI válido (personas humanas) o CUIT + representación legal (personas jurídicas).
- Proporcionar datos verídicos y mantenerlos actualizados.

La plataforma podrá verificar la identidad declarada y suspender cuentas con datos falsos o inconsistentes.

Protección de datos (Ley 25.326): Los datos personales son tratados conforme a la Ley 25.326 de Protección de Datos Personales. El responsable del tratamiento es [Nombre de la Empresa]. Los datos se conservan por 2 años post-baja.

Derechos ARCO: El usuario puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición enviando un correo a protecciondedatos@viviendaya.com. El plazo de respuesta es de 10 días hábiles.

3. PLANES, SUSCRIPCIONES Y PAGOS

Plan GRATIS: 3 videos activos/mes · 60 seg/video · Estadísticas básicas · Chat · Verificación ARRYSE incluida.

Plan PRO (USD 1,50/semana): 15 videos activos/mes · Badge PRO · 1 destacado/semana · Soporte prioritario · 7 días de prueba gratis.

Plan INMOBILIARIA PREMIUM (USD 25/mes): 50 videos/mes · hasta 5 min/video · 5 agentes · 5 destacados/mes.

4. SISTEMA ARRYSE
ARRYSE verifica que el video fue grabado en el lugar declarado mediante GPS. Es gratuito, automático e inmediato.

5. JURISDICCIÓN
Ley aplicable: República Argentina. Tribunales Ordinarios de CABA.`

export default function RegistroPage() {
  const router = useRouter()
  const { addCredits } = useAuth()

  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showTyC, setShowTyC] = useState(false)
  const [aceptaTyC, setAceptaTyC] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [telefono, setTelefono] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [dniFront, setDniFront] = useState<string | null>(null)
  const [dniBack, setDniBack] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanSide, setScanSide] = useState<'front' | 'back' | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const calcularEdad = (fecha: string) => {
    const hoy = new Date()
    const nac = new Date(fecha)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad
  }

  const handlePaso1 = () => {
    setError("")
    if (!email || !password || !confirmPassword) return setError("Completá todos los campos")
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres")
    if (password !== confirmPassword) return setError("Las contraseñas no coinciden")
    setStep(2)
  }

  const handlePaso2 = () => {
    setError("")
    if (!nombre || !apellido || !telefono || !fechaNacimiento) return setError("Completá todos los campos")
    if (calcularEdad(fechaNacimiento) < 18) return setError("Debés ser mayor de 18 años para registrarte")
    setStep(3)
  }

  const handleScanDNI = (side: 'front' | 'back') => {
    setScanSide(side)
    fileRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !scanSide) return
    setScanning(true)
    setError("")
    const reader = new FileReader()
    reader.onload = () => {
      if (scanSide === 'front') setDniFront(reader.result as string)
      else setDniBack(reader.result as string)
    }
    reader.readAsDataURL(file)
    try {
      const worker: any = await createWorker()
      await worker.load()
      await worker.loadLanguage("spa")
      await worker.initialize("spa")
      const { data } = await worker.recognize(file)
      await worker.terminate()
      if (scanSide === 'front' && !fechaNacimiento) {
        const match = data.text.match(/(\d{2}[\/\-.]\d{2}[\/\-.]\d{4})/)
        if (match) {
          const parts = match[1].split(/[\/\-.]/)
          setFechaNacimiento(`${parts[2]}-${parts[1]}-${parts[0]}`)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setScanning(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handlePaso3 = () => {
    setError("")
    if (!dniFront || !dniBack) return setError("Necesitamos foto del frente y dorso de tu DNI")
    setStep(4)
  }

  const handleRegistro = async () => {
    if (!aceptaTyC) return setError("Debés aceptar los Términos y Condiciones")
    setLoading(true)
    setError("")
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { nombre, apellido, telefono, fecha_nacimiento: fechaNacimiento, dni_verificado: false } }
      })
      if (signUpError) throw signUpError

      if (signUpData.user) {
        await supabase.from('users').insert({
          id: signUpData.user.id,
          email,
          full_name: `${nombre} ${apellido}`,
          phone: telefono,
          credits: 101,
        })
      }

      addCredits(1, "Recompensa por verificación")
      router.push('/')
    } catch (err: any) {
      setError(err.message === 'User already registered' ? 'Este email ya tiene una cuenta. Iniciá sesión.' : err.message || 'Error al registrarse')
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

  const btn: React.CSSProperties = {
    width: '100%', padding: '16px', borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
    color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    marginTop: 20,
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* MODAL T&C */}
      {showTyC && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
          <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Términos y Condiciones</span>
            <button onClick={() => setShowTyC(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <pre style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', margin: 0 }}>
              {TYC_CONTENT}
            </pre>
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => { setAceptaTyC(true); setShowTyC(false); }} style={{ ...btn, marginTop: 0 }}>
              Acepto los Términos y Condiciones ✓
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
          style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
          Vivienda<span style={{ color: '#22C55E' }}>Ya</span>
        </span>
      </div>

      {/* PROGRESS */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? '#2563EB' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Paso {step} de 4</span>
      </div>

      <div style={{ flex: 1, padding: '0 20px', overflowY: 'auto', paddingBottom: 32 }}>

        {/* PASO 1 */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.5 }}>Creá tu cuenta</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 24px' }}>Tu email y una contraseña segura</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={inp} />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña (mínimo 6 caracteres)" type="password" style={inp} />
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repetir contraseña" type="password" style={inp} />
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={handlePaso1} style={btn}>Continuar →</button>
            <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
              ¿Ya tenés cuenta?{' '}
              <span onClick={() => router.push('/login')} style={{ color: '#22C55E', cursor: 'pointer', fontWeight: 600 }}>Iniciá sesión</span>
            </p>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.5 }}>Tus datos</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 24px' }}>Verificamos que sos mayor de 18 años</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" style={{ ...inp, flex: 1 }} />
                <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" style={{ ...inp, flex: 1 }} />
              </div>
              <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono" type="tel" style={inp} />
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 6px' }}>Fecha de nacimiento</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder="DD" maxLength={2} inputMode="numeric"
                    style={{ ...inp, flex: 1, textAlign: 'center' }}
                    onChange={e => {
                      const d = e.target.value.replace(/\D/g, '')
                      const parts = fechaNacimiento.split('-')
                      setFechaNacimiento(`${parts[0] || ''}${parts[1] ? '-'+parts[1] : ''}-${d}`.replace(/^-|-$/g,'') || `--${d}`)
                    }}
                  />
                  <input
                    placeholder="MM" maxLength={2} inputMode="numeric"
                    style={{ ...inp, flex: 1, textAlign: 'center' }}
                    onChange={e => {
                      const m = e.target.value.replace(/\D/g, '')
                      const parts = fechaNacimiento.split('-')
                      setFechaNacimiento(`${parts[0] || ''}-${m}-${parts[2] || ''}`)
                    }}
                  />
                  <input
                    placeholder="AAAA" maxLength={4} inputMode="numeric"
                    style={{ ...inp, flex: 2, textAlign: 'center' }}
                    onChange={e => {
                      const y = e.target.value.replace(/\D/g, '')
                      const parts = fechaNacimiento.split('-')
                      setFechaNacimiento(`${y}-${parts[1] || ''}-${parts[2] || ''}`)
                    }}
                  />
                </div>
              </div>
              {fechaNacimiento && calcularEdad(fechaNacimiento) < 18 && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>⚠️ Debés ser mayor de 18 años para registrarte</p>
                </div>
              )}
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={handlePaso2} style={btn}>Continuar →</button>
          </div>
        )}

        {/* PASO 3 - DNI */}
        {step === 3 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.5 }}>Verificá tu identidad</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 12px' }}>Foto del DNI — frente y dorso</p>

            <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>🔒 Datos protegidos. Solo para verificar tu identidad (Ley 25.326)</p>
            </div>

            {/* Input oculto — sin capture para evitar rotación */}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
            

            {/* FRENTE + DORSO lado a lado */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {(['front', 'back'] as const).map(side => {
                const img = side === 'front' ? dniFront : dniBack
                const label = side === 'front' ? 'Frente' : 'Dorso'
                return (
                  <div key={side} style={{ flex: 1 }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '0 0 6px', fontWeight: 600, textAlign: 'center' }}>
                      {label} {img && <span style={{ color: '#22C55E' }}>✓</span>}
                    </p>
                    <div onClick={() => handleScanDNI(side)} style={{
                      height: 110, borderRadius: 12,
                      border: `2px dashed ${img ? '#22C55E' : 'rgba(255,255,255,0.2)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', overflow: 'hidden', background: 'rgba(255,255,255,0.03)',
                      position: 'relative',
                    }}>
                      {scanning && scanSide === side ? (
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0, textAlign: 'center', padding: '0 8px' }}>⏳ Procesando...</p>
                      ) : img ? (
                        <>
                          <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: 6, right: 6, background: '#22C55E', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</div>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: 22 }}>📷</span>
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '6px 0 0', textAlign: 'center', padding: '0 6px' }}>Tocá para fotografiar</p>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{error}</p>}

            <button onClick={handlePaso3} disabled={scanning} style={{ ...btn, marginTop: 12, opacity: scanning ? 0.6 : 1 }}>
              {scanning ? 'Procesando...' : 'Continuar →'}
            </button>
          </div>
        )}

        {/* PASO 4 - CONFIRMACIÓN */}
        {step === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.5 }}>¡Todo listo!</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, margin: '0 0 6px', lineHeight: 1.6 }}>
              Tu cuenta está siendo verificada.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, margin: '0 0 20px' }}>
              Mientras tanto podés explorar propiedades.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{nombre} {apellido}</p>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{email}</p>
                </div>
              </div>
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                <p style={{ margin: 0, color: '#22C55E', fontSize: 12, fontWeight: 600 }}>🎁 +1 crédito de bienvenida</p>
              </div>
            </div>

            {/* T&C */}
            <div style={{ textAlign: 'left', marginBottom: 8 }}>
              <div onClick={() => setAceptaTyC(!aceptaTyC)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  background: aceptaTyC ? '#2563EB' : 'rgba(255,255,255,0.08)',
                  border: `2px solid ${aceptaTyC ? '#2563EB' : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {aceptaTyC && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  He leído y acepto los{' '}
                  <span onClick={e => { e.stopPropagation(); setShowTyC(true); }} style={{ color: '#22C55E', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>
                    Términos y Condiciones
                  </span>
                  {' '}de Vivienda Ya, incluyendo la Política de Privacidad y el tratamiento de mis datos según la Ley 25.326.
                </p>
              </div>
            </div>

            {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 8, textAlign: 'left' }}>{error}</p>}
            <button onClick={handleRegistro} disabled={loading || !aceptaTyC} style={{ ...btn, marginTop: 16, opacity: (loading || !aceptaTyC) ? 0.5 : 1, cursor: !aceptaTyC ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creando cuenta...' : 'Empezar a explorar →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
