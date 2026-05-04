"use client"

import { useState, useRef, ChangeEvent } from "react"
import { createWorker } from "tesseract.js"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type Step = 1 | 2 | 3 | 4

const PROVINCIAS = [
  "Buenos Aires","CABA","Córdoba","Santa Fe","Mendoza","Tucumán","Salta",
  "Entre Ríos","Misiones","Chaco","Corrientes","Santiago del Estero","San Juan",
  "Jujuy","Río Negro","Neuquén","Formosa","Chubut","San Luis","Catamarca",
  "La Rioja","La Pampa","Santa Cruz","Tierra del Fuego"
]

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
  const [fechaDia, setFechaDia] = useState("")
  const [fechaMes, setFechaMes] = useState("")
  const [fechaAnio, setFechaAnio] = useState("")
  const [provincia, setProvincia] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [dniFront, setDniFront] = useState<string | null>(null)
  const [dniBack, setDniBack] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanSide, setScanSide] = useState<"front" | "back" | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const getFechaNacimiento = () => {
    if (!fechaDia || !fechaMes || !fechaAnio) return ""
    return `${fechaAnio}-${fechaMes.padStart(2,"0")}-${fechaDia.padStart(2,"0")}`
  }

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
    if (!email || !password || !confirmPassword) return setError("Completa todos los campos")
    if (password.length < 6) return setError("La contrasena debe tener al menos 6 caracteres")
    if (password !== confirmPassword) return setError("Las contrasenas no coinciden")
    setStep(2)
  }

  const handlePaso2 = () => {
    setError("")
    const fecha = getFechaNacimiento()
    if (!nombre || !apellido || !telefono || !fecha) return setError("Completa todos los campos")
    if (calcularEdad(fecha) < 18) return setError("Debes ser mayor de 18 anos para registrarte")
    if (!provincia || !ciudad) return setError("Selecciona tu provincia de residencia e ingresa tu ciudad")
    setStep(3)
  }

  const handleScanDNI = (side: "front" | "back") => {
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
      if (scanSide === "front") setDniFront(reader.result as string)
      else setDniBack(reader.result as string)
    }
    reader.readAsDataURL(file)
    try {
      const worker: any = await createWorker()
      await worker.load()
      await worker.loadLanguage("spa")
      await worker.initialize("spa")
      await worker.terminate()
    } catch (err) {
      console.error(err)
    } finally {
      setScanning(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handlePaso3 = async () => {
    setError("")
    if (!dniFront || !dniBack) return setError("Necesitamos foto del frente y dorso de tu DNI")
    setScanning(true)
    try {
      const res = await fetch("/api/verificar-dni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dniFront, dniBack, userId: null }),
      })
      const data = await res.json()
      if (!data.result?.valido) {
        setError(data.result?.motivo || "DNI no valido. Por favor saca una foto mas clara.")
        setScanning(false)
        return
      }
      setStep(4)
    } catch {
      setError("Error al verificar el DNI. Intenta de nuevo.")
    } finally {
      setScanning(false)
    }
  }

  // ✅ Función base: crea la cuenta en Supabase Auth + users + channels
  // Devuelve el userId si fue exitoso, null si hubo error
  const crearCuentaBase = async (): Promise<string | null> => {
    const fecha = getFechaNacimiento()
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre, apellido, telefono, fecha_nacimiento: fecha, dni_verificado: false } }
    })
    if (signUpError) throw signUpError
    if (!signUpData.user) throw new Error("No se pudo crear el usuario")

    const uid = signUpData.user.id

    await supabase.from("users").insert({
      id: uid,
      email,
      full_name: `${nombre} ${apellido}`,
      phone: telefono,
      province: provincia,
      city: ciudad,
      credits: 101,
    })

    const slug = `${nombre}-${apellido}`.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    await supabase.from("channels").insert({
      user_id: uid,
      slug: slug + "-" + uid.slice(0, 6),
      nombre: `${nombre} ${apellido}`,
      plan: "gratis",
      verificado: false,
    })

    return uid
  }

  // ✅ Registro como Usuario → va al feed
  const handleRegistroUsuario = async () => {
    if (!aceptaTyC) return setError("Debes aceptar los Terminos y Condiciones")
    setLoading(true)
    setError("")
    try {
      await crearCuentaBase()
      router.push("/")
    } catch (err: any) {
      setError(
        err.message === "User already registered"
          ? "Este email ya tiene una cuenta. Inicia sesion."
          : err.message || "Error al registrarse"
      )
    } finally {
      setLoading(false)
    }
  }

  // ✅ Registro como Agente → crea cuenta y redirige a /RegisterAgent con sesión activa
  const handleRegistroAgente = async () => {
    if (!aceptaTyC) return setError("Debes aceptar los Terminos y Condiciones")
    setLoading(true)
    setError("")
    try {
      await crearCuentaBase()
      // La sesión ya está activa después del signUp
      // /RegisterAgent detectará al usuario logueado y mostrará el formulario de agente
      router.push("/RegisterAgent")
    } catch (err: any) {
      setError(
        err.message === "User already registered"
          ? "Este email ya tiene una cuenta. Inicia sesion."
          : err.message || "Error al registrarse"
      )
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  }

  const btn: React.CSSProperties = {
    width: "100%", padding: "16px", borderRadius: 14, border: "none",
    background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
    color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    marginTop: 24,
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column" }}>

      {showTyC && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", background: "#0a0a0a" }}>
          <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Terminos y Condiciones</span>
            <button onClick={() => setShowTyC(false)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", cursor: "pointer", fontSize: 18 }}>X</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.7 }}>
              Vivienda Ya es una plataforma digital para compra, venta, alquiler y permuta de inmuebles en Argentina. El uso esta disponible para mayores de 18 anos con DNI valido. Los datos personales son tratados conforme a la Ley 25.326. Plan GRATIS incluye 3 videos activos/mes y verificacion ARRYSE. Jurisdiccion: Republica Argentina, Tribunales de CABA.
            </p>
          </div>
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={() => { setAceptaTyC(true); setShowTyC(false) }} style={{ ...btn, marginTop: 0 }}>
              Acepto los Terminos y Condiciones
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span style={{ fontSize: 20, fontWeight: 800 }}>Vivienda<span style={{ color: "#22C55E" }}>Ya</span></span>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? "#2563EB" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Paso {step} de 4</span>
      </div>

      <div style={{ flex: 1, padding: "0 20px 48px", overflowY: "auto" }}>

        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Crea tu cuenta</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 28px" }}>Tu email y una contrasena segura</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={inp} />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contrasena (minimo 6 caracteres)" type="password" style={inp} />
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repetir contrasena" type="password" style={inp} />
            </div>
            {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={handlePaso1} style={btn}>Continuar</button>
            <p style={{ textAlign: "center", marginTop: 20, color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
              Ya tenes cuenta?{" "}
              <span onClick={() => router.push("/login")} style={{ color: "#22C55E", cursor: "pointer", fontWeight: 600 }}>Inicia sesion</span>
            </p>
          </div>
        )}

        {step === 2 && (
          <div style={{ paddingBottom: 120 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Tus datos</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 28px" }}>Verificamos que sos mayor de 18 anos</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" style={{ ...inp, flex: 1 }} />
                <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" style={{ ...inp, flex: 1 }} />
              </div>
              <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Telefono" type="tel" style={inp} />
              <div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "0 0 6px" }}>Fecha de nacimiento</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={fechaDia} onChange={e => setFechaDia(e.target.value.replace(/\D/g,""))} placeholder="DD" maxLength={2} inputMode="numeric" style={{ ...inp, flex: 1, textAlign: "center" }} />
                  <input value={fechaMes} onChange={e => setFechaMes(e.target.value.replace(/\D/g,""))} placeholder="MM" maxLength={2} inputMode="numeric" style={{ ...inp, flex: 1, textAlign: "center" }} />
                  <input value={fechaAnio} onChange={e => setFechaAnio(e.target.value.replace(/\D/g,""))} placeholder="AAAA" maxLength={4} inputMode="numeric" style={{ ...inp, flex: 2, textAlign: "center" }} />
                </div>
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "0 0 6px" }}>Provincia de residencia</p>
                <select
                  value={provincia}
                  onChange={e => { setProvincia(e.target.value); setCiudad("") }}
                  style={{ ...inp, appearance: "none" as any }}
                >
                  <option value="">Selecciona tu provincia</option>
                  {PROVINCIAS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              {provincia && (
                <div>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "0 0 6px" }}>Ciudad de residencia</p>
                  <input
                    value={ciudad}
                    onChange={e => setCiudad(e.target.value)}
                    placeholder="Escribi tu ciudad de residencia"
                    style={inp}
                  />
                </div>
              )}
            </div>
            {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={handlePaso2} style={btn}>Continuar</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Verifica tu identidad</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 10px" }}>Foto del DNI - frente y dorso</p>
            <div style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 24 }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>Datos protegidos. Solo para verificar tu identidad (Ley 25.326)</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: "none" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(["front", "back"] as const).map(side => (
                <div key={side}>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 8px", fontWeight: 600 }}>
                    {side === "front" ? "Frente" : "Dorso"} {(side === "front" ? dniFront : dniBack) && <span style={{ color: "#22C55E" }}>✓</span>}
                  </p>
                  <div onClick={() => handleScanDNI(side)} style={{
                    height: 110, borderRadius: 14,
                    border: `2px dashed ${(side === "front" ? dniFront : dniBack) ? "#22C55E" : "rgba(255,255,255,0.15)"}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", overflow: "hidden", background: "rgba(255,255,255,0.02)",
                  }}>
                    {scanning && scanSide === side ? (
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Escaneando...</p>
                    ) : (side === "front" ? dniFront : dniBack) ? (
                      <img src={(side === "front" ? dniFront : dniBack)!} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Toca para fotografiar</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={handlePaso3} disabled={scanning} style={{ ...btn, opacity: scanning ? 0.6 : 1 }}>
              {scanning ? "Procesando..." : "Continuar"}
            </button>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: "center", paddingTop: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 10px" }}>Todo listo!</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, margin: "0 0 8px", lineHeight: 1.6 }}>
              Tu cuenta fue creada exitosamente.
            </p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, margin: "0 0 28px" }}>
              Elegí cómo querés continuar.
            </p>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16, marginBottom: 24, textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>U</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{nombre} {apellido}</p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{email}</p>
                </div>
              </div>
              {provincia && ciudad && (
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                  📍 {ciudad}, {provincia}
                </p>
              )}
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 12px" }}>
                <p style={{ margin: 0, color: "#22C55E", fontSize: 12, fontWeight: 600 }}>+1 credito de bienvenida</p>
              </div>
            </div>

            {/* TyC */}
            <div style={{ textAlign: "left", marginBottom: 8 }}>
              <div onClick={() => setAceptaTyC(!aceptaTyC)} style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  background: aceptaTyC ? "#2563EB" : "rgba(255,255,255,0.08)",
                  border: `2px solid ${aceptaTyC ? "#2563EB" : "rgba(255,255,255,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {aceptaTyC && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                  He leido y acepto los{" "}
                  <span onClick={e => { e.stopPropagation(); setShowTyC(true) }} style={{ color: "#22C55E", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}>
                    Terminos y Condiciones
                  </span>
                  {" "}de Vivienda Ya.
                </p>
              </div>
            </div>

            {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 8, textAlign: "left" }}>{error}</p>}

            {/* ✅ Botón Usuario */}
            <button
              onClick={handleRegistroUsuario}
              disabled={loading || !aceptaTyC}
              style={{ ...btn, marginTop: 20, opacity: (loading || !aceptaTyC) ? 0.5 : 1 }}
            >
              {loading ? "Creando cuenta..." : "Continuar como Usuario"}
            </button>

            {/* ✅ Botón Agente — crea la cuenta Y redirige a /RegisterAgent con sesión activa */}
            <button
              onClick={handleRegistroAgente}
              disabled={loading || !aceptaTyC}
              style={{
                ...btn, marginTop: 12,
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                opacity: (loading || !aceptaTyC) ? 0.5 : 1,
              }}
            >
              {loading ? "Creando cuenta..." : "Continuar como Agente →"}
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 16, lineHeight: 1.5 }}>
              Como agente completarás un paso adicional con tus datos profesionales.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}