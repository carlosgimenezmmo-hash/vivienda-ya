'use client';
import { useState, useRef, ChangeEvent } from 'react';
import { registerAgent } from '../services/agentService';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

type Step = 1 | 2 | 3 | 4 | 5;

const PROVINCIAS = [
  "Buenos Aires","CABA","Córdoba","Santa Fe","Mendoza","Tucumán","Salta",
  "Entre Ríos","Misiones","Chaco","Corrientes","Santiago del Estero","San Juan",
  "Jujuy","Río Negro","Neuquén","Formosa","Chubut","San Luis","Catamarca",
  "La Rioja","La Pampa","Santa Cruz","Tierra del Fuego"
];

export default function RegisterAgentScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aceptaTyC, setAceptaTyC] = useState(false);
  const [showTyC, setShowTyC] = useState(false);

  // Paso 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Paso 2
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaDia, setFechaDia] = useState('');
  const [fechaMes, setFechaMes] = useState('');
  const [fechaAnio, setFechaAnio] = useState('');
  const [provincia, setProvincia] = useState('');
  const [ciudad, setCiudad] = useState('');

  // Paso 3 — DNI
  const [dniFront, setDniFront] = useState<string | null>(null);
  const [dniBack, setDniBack] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanSide, setScanSide] = useState<'front' | 'back' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Paso 4 — datos de agente
  const [agentCity, setAgentCity] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentErrors, setAgentErrors] = useState<Record<string, string>>({});

  const getFechaNacimiento = () => {
    if (!fechaDia || !fechaMes || !fechaAnio) return '';
    return `${fechaAnio}-${fechaMes.padStart(2,'0')}-${fechaDia.padStart(2,'0')}`;
  };

  const calcularEdad = (fecha: string) => {
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  };

  const handlePaso1 = () => {
    setError('');
    if (!email || !password || !confirmPassword) return setError('Completá todos los campos');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden');
    setStep(2);
  };

  const handlePaso2 = () => {
    setError('');
    const fecha = getFechaNacimiento();
    if (!nombre || !apellido || !telefono || !fecha) return setError('Completá todos los campos');
    if (calcularEdad(fecha) < 18) return setError('Debés ser mayor de 18 años');
    if (!provincia || !ciudad) return setError('Seleccioná tu provincia e ingresá tu ciudad');
    if (!agentPhone) setAgentPhone(telefono);
    if (!agentCity) setAgentCity(ciudad);
    setStep(3);
  };

  const handleScanDNI = (side: 'front' | 'back') => {
    setScanSide(side);
    fileRef.current?.click();
  };

  // ✅ Comprime la imagen a máximo 1MB antes de enviar a la API
  const comprimirImagen = (base64: string, maxWidth = 1200, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = base64;
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scanSide) return;
    setScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Original = reader.result as string;
      // Comprimir antes de guardar en estado
      const base64Comprimida = await comprimirImagen(base64Original);
      if (scanSide === 'front') setDniFront(base64Comprimida);
      else setDniBack(base64Comprimida);
    };
    reader.readAsDataURL(file);
    // ✅ Tesseract eliminado — la verificación real la hace Gemini en la API
    setTimeout(() => {
      setScanning(false);
      if (fileRef.current) fileRef.current.value = '';
    }, 300);
  };

  const handlePaso3 = async () => {
    setError('');
    if (!dniFront || !dniBack) return setError('Necesitamos foto del frente y dorso de tu DNI');
    setScanning(true);
    try {
      const res = await fetch('/api/verificar-dni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dniFront, dniBack, userId: null }),
      });
      const data = await res.json();
      if (!data.result?.valido) {
        setError(data.result?.motivo || 'DNI no válido. Por favor sacá una foto más clara.');
        return;
      }
      setStep(4);
    } catch {
      setError('Error al verificar el DNI. Intentá de nuevo.');
    } finally {
      setScanning(false);
    }
  };

  const handlePaso4 = () => {
    setError('');
    const errs: Record<string, string> = {};
    if (!agentCity.trim()) errs.city = 'Ingresá tu ciudad de operación';
    if (!agentPhone.trim()) errs.phone = 'Ingresá tu teléfono profesional';
    else if (agentPhone.replace(/\D/g, '').length < 8) errs.phone = 'Teléfono inválido';
    if (!agentDescription.trim()) errs.description = 'Escribí una descripción';
    else if (agentDescription.trim().length < 20) errs.description = 'Mínimo 20 caracteres';
    setAgentErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep(5);
  };

  const handleActivar = async () => {
    if (!aceptaTyC) return setError('Debés aceptar los Términos y Condiciones');
    setLoading(true);
    setError('');
    try {
      const fecha = getFechaNacimiento();

      // 1. Crear cuenta
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { nombre, apellido, telefono, fecha_nacimiento: fecha, dni_verificado: false } }
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('No se pudo crear el usuario');
      const uid = signUpData.user.id;
      console.log('[RegisterAgent] Usuario creado:', uid);

      // 2. Insert users
      await supabase.from('users').insert({
        id: uid, email,
        full_name: `${nombre} ${apellido}`,
        phone: telefono, province: provincia, city: ciudad, credits: 101,
      });

      // 3. Crear canal
      const slug = `${nombre}-${apellido}`.toLowerCase()
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await supabase.from('channels').insert({
        user_id: uid,
        slug: slug + '-' + uid.slice(0, 6),
        nombre: `${nombre} ${apellido}`,
        plan: 'agente', verificado: false,
      });

      // 4. Registrar como agente
      const result = await registerAgent({
        city: agentCity, phone: agentPhone, description: agentDescription,
      }, uid);
      console.log('[RegisterAgent] Resultado:', result);

      if (result?.success) {
        router.push('/AgentDashboard');
      } else {
        throw new Error(result?.error || 'No se pudo activar la cuenta de agente');
      }
    } catch (err: any) {
      console.error('[RegisterAgent] Error:', err);
      setError(
        err.message === 'User already registered'
          ? 'Este email ya tiene una cuenta. Iniciá sesión.'
          : err.message || 'Error al registrarse'
      );
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  };

  const btn: React.CSSProperties = {
    width: '100%', padding: '16px', borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
    color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    marginTop: 24, boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* TyC */}
      {showTyC && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
          <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Términos y Condiciones</span>
            <button onClick={() => setShowTyC(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', cursor: 'pointer', fontSize: 18 }}>X</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.7 }}>
              Vivienda Ya es una plataforma digital para compra, venta, alquiler y permuta de inmuebles en Argentina. El uso está disponible para mayores de 18 años con DNI válido. Los datos personales son tratados conforme a la Ley 25.326. La cuenta de agente incluye 30 días de prueba gratuita. Jurisdicción: República Argentina, Tribunales de CABA.
            </p>
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => { setAceptaTyC(true); setShowTyC(false); }} style={{ ...btn, marginTop: 0 }}>
              Acepto los Términos y Condiciones
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
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>Vivienda<span style={{ color: '#22C55E' }}>Ya</span></span>
          <span style={{ marginLeft: 10, fontSize: 11, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '3px 10px', color: '#22C55E', fontWeight: 700 }}>AGENTE</span>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {[1,2,3,4,5].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? '#22C55E' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Paso {step} de 5</span>
      </div>

      <div style={{ flex: 1, padding: '0 20px 48px', overflowY: 'auto' }}>

        {/* PASO 1 */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Creá tu cuenta</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' }}>Tu email y una contraseña segura</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={inp} />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña (mínimo 6 caracteres)" type="password" style={inp} />
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repetir contraseña" type="password" style={inp} />
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={handlePaso1} style={btn}>Continuar</button>
            <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
              ¿Ya tenés cuenta?{' '}
              <span onClick={() => router.push('/login')} style={{ color: '#22C55E', cursor: 'pointer', fontWeight: 600 }}>Iniciá sesión</span>
            </p>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div style={{ paddingBottom: 120 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Tus datos</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' }}>Verificamos que sos mayor de 18 años</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" style={{ ...inp, flex: 1 }} />
                <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" style={{ ...inp, flex: 1 }} />
              </div>
              <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono" type="tel" style={inp} />
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 6px' }}>Fecha de nacimiento</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={fechaDia} onChange={e => setFechaDia(e.target.value.replace(/\D/g,''))} placeholder="DD" maxLength={2} inputMode="numeric" style={{ ...inp, flex: 1, textAlign: 'center' }} />
                  <input value={fechaMes} onChange={e => setFechaMes(e.target.value.replace(/\D/g,''))} placeholder="MM" maxLength={2} inputMode="numeric" style={{ ...inp, flex: 1, textAlign: 'center' }} />
                  <input value={fechaAnio} onChange={e => setFechaAnio(e.target.value.replace(/\D/g,''))} placeholder="AAAA" maxLength={4} inputMode="numeric" style={{ ...inp, flex: 2, textAlign: 'center' }} />
                </div>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 6px' }}>Provincia de residencia</p>
                <select value={provincia} onChange={e => { setProvincia(e.target.value); setCiudad(''); }} style={{ ...inp, appearance: 'none' as any }}>
                  <option value="">Seleccioná tu provincia</option>
                  {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {provincia && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 6px' }}>Ciudad de residencia</p>
                  <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Escribí tu ciudad" style={inp} />
                </div>
              )}
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={handlePaso2} style={btn}>Continuar</button>
          </div>
        )}

        {/* PASO 3 — DNI */}
        {step === 3 && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Verificá tu identidad</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 10px' }}>Foto del DNI — frente y dorso</p>
            <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>Datos protegidos. Solo para verificar tu identidad (Ley 25.326)</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(['front', 'back'] as const).map(side => (
                <div key={side}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 8px', fontWeight: 600 }}>
                    {side === 'front' ? 'Frente' : 'Dorso'} {(side === 'front' ? dniFront : dniBack) && <span style={{ color: '#22C55E' }}>✓</span>}
                  </p>
                  <div onClick={() => handleScanDNI(side)} style={{
                    height: 110, borderRadius: 14,
                    border: `2px dashed ${(side === 'front' ? dniFront : dniBack) ? '#22C55E' : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', background: 'rgba(255,255,255,0.02)',
                  }}>
                    {scanning && scanSide === side ? (
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Escaneando...</p>
                    ) : (side === 'front' ? dniFront : dniBack) ? (
                      <img src={(side === 'front' ? dniFront : dniBack)!} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Tocá para fotografiar</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={handlePaso3} disabled={scanning} style={{ ...btn, opacity: scanning ? 0.6 : 1 }}>
              {scanning ? 'Procesando...' : 'Continuar'}
            </button>
          </div>
        )}

        {/* PASO 4 — Perfil de agente */}
        {step === 4 && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Tu perfil de agente</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' }}>Datos que verán compradores e inquilinos</p>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Ciudad donde operás *</label>
              <input
                style={{ ...inp, borderColor: agentErrors.city ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                placeholder="Ej: Buenos Aires, Córdoba, Mendoza"
                value={agentCity}
                onChange={e => { setAgentCity(e.target.value); setAgentErrors(p => ({ ...p, city: '' })); }}
              />
              {agentErrors.city && <p style={errorStyle}>{agentErrors.city}</p>}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Teléfono profesional *</label>
              <input
                style={{ ...inp, borderColor: agentErrors.phone ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                placeholder="+54 9 11 1234-5678"
                value={agentPhone}
                onChange={e => { setAgentPhone(e.target.value); setAgentErrors(p => ({ ...p, phone: '' })); }}
              />
              {agentErrors.phone && <p style={errorStyle}>{agentErrors.phone}</p>}
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Descripción profesional *</label>
              <textarea
                style={{ ...inp, borderColor: agentErrors.description ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)', minHeight: 110, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Contanos sobre tu experiencia, especialidad, zona que cubrís..."
                value={agentDescription}
                onChange={e => { setAgentDescription(e.target.value); setAgentErrors(p => ({ ...p, description: '' })); }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {agentErrors.description ? <p style={{ ...errorStyle, margin: 0 }}>{agentErrors.description}</p> : <span />}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{agentDescription.length} chars</span>
              </div>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '16px 18px', marginBottom: 28 }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#22C55E', letterSpacing: 0.5 }}>✦ BENEFICIOS DE AGENTE</p>
              {['📊 Dashboard con estadísticas completas','🏠 Gestión ilimitada de propiedades','💬 Historial de contactos y consultas','⭐ Insignia verificado en tu perfil','📈 Análisis de rendimiento por zona'].map((b, i) => (
                <p key={i} style={{ margin: '0 0 6px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{b}</p>
              ))}
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={handlePaso4} style={btn}>Continuar</button>
          </div>
        )}

        {/* PASO 5 — Confirmación */}
        {step === 5 && (
          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>🏢</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px' }}>¡Todo listo!</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, margin: '0 0 24px', lineHeight: 1.6 }}>Revisá tu información antes de activar.</p>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #22C55E, #16A34A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏢</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{nombre} {apellido}</p>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{email}</p>
                </div>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>📍 {agentCity}</p>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>📞 {agentPhone}</p>
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                <p style={{ margin: 0, color: '#22C55E', fontSize: 12, fontWeight: 700 }}>30 DÍAS DE PRUEBA GRATUITA</p>
              </div>
            </div>
            <div style={{ textAlign: 'left', marginBottom: 8 }}>
              <div onClick={() => setAceptaTyC(!aceptaTyC)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, background: aceptaTyC ? '#22C55E' : 'rgba(255,255,255,0.08)', border: `2px solid ${aceptaTyC ? '#22C55E' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {aceptaTyC && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  He leído y acepto los{' '}
                  <span onClick={e => { e.stopPropagation(); setShowTyC(true); }} style={{ color: '#22C55E', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>Términos y Condiciones</span>{' '}de ViviendaYa.
                </p>
              </div>
            </div>
            {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 8, textAlign: 'left' }}>{error}</p>}
            <button onClick={handleActivar} disabled={loading || !aceptaTyC} style={{ ...btn, marginTop: 20, opacity: (loading || !aceptaTyC) ? 0.5 : 1, cursor: (loading || !aceptaTyC) ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Activando cuenta...' : 'Activar cuenta de agente →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 16, lineHeight: 1.5 }}>
              Podés cancelar en cualquier momento durante la prueba gratuita.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 700,
  color: 'rgba(255,255,255,0.6)', marginBottom: 8, letterSpacing: 0.3,
};

const errorStyle: React.CSSProperties = {
  fontSize: 12, color: '#EF4444', margin: '5px 0 0',
};