"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthSheet } from "@/components/auth-sheet"


export function BottomNav() {
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [showSheet, setShowSheet] = useState(false)
  

  const active = pathname === "/feed" ? "inicio" : pathname.startsWith("/buscar") ? "buscar" : pathname.startsWith("/publicar") ? "publicar" : pathname.startsWith("/perfil") ? "perfil" : "otro"

  

  const handlePublicar = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isLoggedIn) { setShowSheet(true) } else { router.push('/publicar') }
  }

  const col = (id: string) => active === id ? '#fff' : 'rgba(255,255,255,0.45)'

  if (pathname === "/") return null

  return (
    <>
      <AuthSheet visible={showSheet} onClose={() => setShowSheet(false)} action="contactar por WhatsApp" />
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', height: 64 }}>

        <Link href="/feed" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill={active === 'inicio' ? '#fff' : 'none'} stroke={col('inicio')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span style={{ fontSize: 15, color: col('inicio'), fontWeight: active === 'inicio' ? 700 : 400 }}>Inicio</span>
        </Link>

        <Link href="/buscar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={col('buscar')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span style={{ fontSize: 15, color: col('buscar'), fontWeight: active === 'buscar' ? 700 : 400 }}>Propiedades</span>
        </Link>

        <Link href="/publicar" onClick={handlePublicar} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', marginTop: -16 }}>
          <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,99,235,0.6)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </span>
          <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', fontWeight: 400, marginTop: 2 }}>Publicar</span>
        </Link>

        

        <Link href="/perfil" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={col('perfil')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span style={{ fontSize: 15, color: col('perfil'), fontWeight: active === 'perfil' ? 700 : 400 }}>Perfil</span>
        </Link>

      </nav>
    </>
  )
}





