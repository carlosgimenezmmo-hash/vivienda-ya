'use client';
import { useState, useEffect } from 'react';
import { registerAgent } from '../services/agentService';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function RegisterAgentScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    city: '',
    phone: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('[RegisterAgent] getUser result:', { user: user?.id, error });
        if (!user) {
          router.push('/registro');
          return;
        }
        setUserId(user.id);
        setUserEmail(user.email || '');
      } catch (err) {
        console.error('[RegisterAgent] Error obteniendo usuario:', err);
        router.push('/registro');
      } finally {
        setCheckingAuth(false);
      }
    };
    getUser();
  }, [router]);

  const validate = () => {
    const newErrors = {};
    if (!formData.city.trim()) newErrors.city = 'Ingresá tu ciudad';
    if (!formData.phone.trim()) newErrors.phone = 'Ingresá tu teléfono';
    else if (formData.phone.replace(/\D/g, '').length < 8) newErrors.phone = 'Teléfono inválido';
    if (!formData.description.trim()) newErrors.description = 'Escribí una descripción';
    else if (formData.description.trim().length < 20) newErrors.description = 'Mínimo 20 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    console.log('[RegisterAgent] handleRegister - userId:', userId);

    if (!validate()) return;

    if (!userId) {
      alert('Sesión expirada. Por favor iniciá sesión nuevamente.');
      router.push('/registro');
      return;
    }

    setLoading(true);
    try {
      const result = await registerAgent(formData, userId);
      console.log('[RegisterAgent] Resultado:', result);

      if (result?.success) {
        router.push('/AgentDashboard');
      } else {
        const msg = result?.error || 'No se pudo registrar el agente';
        console.error('[RegisterAgent] Error:', msg);
        alert('Error: ' + msg);
      }
    } catch (err) {
      console.error('[RegisterAgent] Excepción:', err);
      alert('Error inesperado. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Loading auth
  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: 100,
    }}>

      {/* HEADER */}
      <div style={{
        padding: '52px 24px 28px',
        background: 'linear-gradient(180deg, rgba(37,99,235,0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button onClick={() => router.back()} style={{
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
          width: 38, height: 38, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
          }}>
            🏢
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Cuenta de Agente</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '3px 0 0' }}>
              30 días gratis · $40 USD/mes después
            </p>
          </div>
        </div>

        {/* Badge trial */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 20, padding: '6px 14px',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#22C55E' }}>PRUEBA GRATUITA — 30 DÍAS</span>
        </div>
      </div>

      {/* FORM */}
      <div style={{ padding: '28px 24px', maxWidth: 560, margin: '0 auto' }}>

        {/* Email readonly */}
        {userEmail ? (
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Cuenta</label>
            <div style={{
              ...inputStyle,
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'default',
            }}>
              {userEmail}
            </div>
          </div>
        ) : null}

        {/* Ciudad */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Ciudad donde operás *</label>
          <input
            style={{ ...inputStyle, borderColor: errors.city ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
            placeholder="Ej: Buenos Aires, Córdoba, Mendoza"
            value={formData.city}
            onChange={(e) => { setFormData({ ...formData, city: e.target.value }); setErrors(p => ({ ...p, city: '' })); }}
          />
          {errors.city && <p style={errorStyle}>{errors.city}</p>}
        </div>

        {/* Teléfono */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Teléfono de contacto *</label>
          <input
            style={{ ...inputStyle, borderColor: errors.phone ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
            placeholder="+54 9 11 1234-5678"
            value={formData.phone}
            onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors(p => ({ ...p, phone: '' })); }}
          />
          {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Descripción profesional *</label>
          <textarea
            style={{
              ...inputStyle,
              borderColor: errors.description ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
              minHeight: 110, resize: 'vertical', fontFamily: 'inherit',
            }}
            placeholder="Contanos sobre tu experiencia, especialidad, zona que cubrís..."
            value={formData.description}
            onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setErrors(p => ({ ...p, description: '' })); }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {errors.description
              ? <p style={{ ...errorStyle, margin: 0 }}>{errors.description}</p>
              : <span />
            }
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{formData.description.length} chars</span>
          </div>
        </div>

        {/* Beneficios */}
        <div style={{
          background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: 14, padding: '16px 18px', marginBottom: 28,
        }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#60A5FA', letterSpacing: 0.5 }}>
            ✦ BENEFICIOS DE AGENTE
          </p>
          {[
            '📊 Dashboard con estadísticas completas',
            '🏠 Gestión ilimitada de propiedades',
            '💬 Historial de contactos y consultas',
            '⭐ Insignia verificado en tu perfil',
            '📈 Análisis de rendimiento por zona',
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{b}</span>
            </div>
          ))}
        </div>

        {/* Botón principal */}
        <button
          onClick={handleRegister}
          disabled={loading || !userId}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', marginBottom: 12,
            boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)',
          }}
        >
          {loading ? 'Procesando...' : 'Activar cuenta de agente →'}
        </button>

        <button
          onClick={() => router.back()}
          style={{
            width: '100%', padding: '14px', borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent', color: 'rgba(255,255,255,0.4)',
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Por ahora no, gracias
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 20, lineHeight: 1.5 }}>
          Al registrarte aceptás los términos de uso de ViviendaYa.{'\n'}
          Podés cancelar en cualquier momento durante la prueba.
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.6)',
  marginBottom: 8,
  letterSpacing: 0.3,
};

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  fontSize: 15,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
};

const errorStyle = {
  fontSize: 12,
  color: '#EF4444',
  margin: '5px 0 0',
};