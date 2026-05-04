"use client"
import { useRouter } from "next/navigation"

interface AuthSheetProps {
  visible: boolean
  onClose: () => void
  action?: string
}

export function AuthSheet({ visible, onClose, action }: AuthSheetProps) {
  const router = useRouter()

  if (!visible) return null

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* SHEET */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 91,
        background: '#141414',
        borderRadius: '24px 24px 0 0',
        padding: '12px 24px 48px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
      }}>
        {/* HANDLE */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 28px' }} />

        {/* ICONO */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(37,99,235,0.15)', border: '2px solid rgba(37,99,235,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>

        <h2 style={{
          color: '#fff', fontSize: 22, fontWeight: 800,
          textAlign: 'center', margin: '0 0 8px', letterSpacing: -0.5,
        }}>
          Creá tu cuenta gratis
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.45)', fontSize: 14,
          textAlign: 'center', margin: '0 0 28px', lineHeight: 1.5,
        }}>
          {action
            ? `Para ${action} necesitás una cuenta.`
            : 'Para hacer esta acción necesitás una cuenta.'}
          {' '}Es gratis y rápido.
        </p>

        {/* BENEFICIOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {[
            { icon: '❤️', text: 'Guardá y likeá propiedades' },
            { icon: '💬', text: 'Chateá con propietarios' },
            { icon: '📤', text: 'Publicá tus propiedades' },
            { icon: '📱', text: 'Contactá por WhatsApp' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* ✅ Botón Usuario */}
        <button
          onClick={() => { onClose(); router.push('/registro'); }}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
            marginBottom: 12,
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Registrarme como Usuario
        </button>

        {/* ✅ Botón Agente — mismo flujo de registro, bifurca al final */}
        <button
          onClick={() => { onClose(); router.push('/registro'); }}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
            marginBottom: 12,
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Registrarme como Agente
        </button>

        {/* ✅ Ya tengo cuenta — una sola vez */}
        <button
          onClick={() => { onClose(); router.push('/login'); }}
          style={{
            width: '100%', padding: '15px', borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600,
            cursor: 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Ya tengo cuenta
        </button>
      </div>
    </>
  )
}