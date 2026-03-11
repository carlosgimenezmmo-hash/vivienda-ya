"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const active = pathname === "/" ? "inicio" : pathname.startsWith("/buscar") ? "buscar" : pathname.startsWith("/publicar") ? "publicar" : pathname.startsWith("/perfil") ? "perfil" : "inicio"

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isLoggedIn) router.push('/registro')
  }

  const col = (id: string) => active === id ? '#fff' : 'rgba(255,255,255,0.45)'

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      background: '#0f0f0f',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingTop: 10, paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
      height: 64,
    }}>

      {/* INICIO */}
      <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active === 'inicio' ? '#fff' : 'none'} stroke={col('inicio')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{ fontSize: 10, color: col('inicio'), fontWeight: active === 'inicio' ? 700 : 400 }}>Inicio</span>
      </Link>

      {/* BUSCAR */}
      <Link href="/buscar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={col('buscar')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span style={{ fontSize: 10, color: col('buscar'), fontWeight: active === 'buscar' ? 700 : 400 }}>Buscar</span>
      </Link>

      {/* PUBLICAR */}
      <Link href="/publicar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', marginTop: -16 }}>
        <span style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,99,235,0.6)',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 400, marginTop: 2 }}>Publicar</span>
      </Link>

      {/* WHATSAPP */}
      <Link href="#" onClick={handleWhatsApp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <span style={{
          width: 42, height: 42, borderRadius: '50%',
          background: '#25D366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 12px rgba(37,211,102,0.5)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.522 5.836L.057 23.454a.75.75 0 0 0 .918.918l5.618-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.807 9.807 0 0 1-5.006-1.373l-.36-.214-3.733.973.993-3.627-.235-.374A9.818 9.818 0 1 1 12 21.818z"/>
          </svg>
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>WhatsApp</span>
      </Link>

      {/* PERFIL */}
      <Link href="/perfil" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={col('perfil')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span style={{ fontSize: 10, color: col('perfil'), fontWeight: active === 'perfil' ? 700 : 400 }}>Perfil</span>
      </Link>

    </nav>
  )
}