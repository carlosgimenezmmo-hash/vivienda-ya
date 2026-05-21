"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthSheet } from "@/components/auth-sheet"
import { useActiveProperty } from "@/lib/active-property-context"

export function BottomNav() {
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [showSheet, setShowSheet] = useState(false)
  const { activeProperty } = useActiveProperty()

  const active = pathname === "/feed" ? "inicio" : pathname.startsWith("/buscar") ? "buscar" : pathname.startsWith("/publicar") ? "publicar" : pathname.startsWith("/perfil") ? "perfil" : "otro"

  const handlePublicar = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isLoggedIn) { setShowSheet(true) } else { router.push('/publicar') }
  }

  if (pathname === "/") return null

  return (
    <>
      <AuthSheet visible={showSheet} onClose={() => setShowSheet(false)} action="publicar" />
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 10,
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        height: 72,
      }}>

        <Link href="/feed" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active === 'inicio' ? 'rgba(255,255,255,0.12)' : 'transparent', transition: 'background 0.2s' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active === 'inicio' ? '#fff' : 'none'} stroke={active === 'inicio' ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontSize: 12, color: active === 'inicio' ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: active === 'inicio' ? 700 : 400, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Inicio</span>
        </Link>

        <Link href="/buscar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active === 'buscar' ? 'rgba(255,255,255,0.12)' : 'transparent', transition: 'background 0.2s' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active === 'buscar' ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <span style={{ fontSize: 12, color: active === 'buscar' ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: active === 'buscar' ? 700 : 400, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Buscar</span>
        </Link>

        {/* Botón publicar central */}
        <Link href="/publicar" onClick={handlePublicar} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', marginTop: -20 }}>
          <span style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #22C55E, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(34,197,94,0.5)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginTop: 2, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Publicar</span>
        </Link>

        <Link href="/inbox" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active === 'inbox' ? 'rgba(255,255,255,0.12)' : 'transparent', transition: 'background 0.2s' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active === 'inbox' ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{ fontSize: 12, color: active === 'inbox' ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: active === 'inbox' ? 700 : 400, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Mensajes</span>
        </Link>

        <Link href="/perfil" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active === 'perfil' ? 'rgba(255,255,255,0.12)' : 'transparent', transition: 'background 0.2s' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active === 'perfil' ? '#fff' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span style={{ fontSize: 12, color: active === 'perfil' ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: active === 'perfil' ? 700 : 400, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Perfil</span>
        </Link>

      </nav>
    </>
  )
}