"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const getActiveTab = () => {
    if (pathname === "/") return "inicio"
    if (pathname.startsWith("/buscar")) return "buscar"
    if (pathname.startsWith("/publicar")) return "publicar"
    if (pathname.startsWith("/perfil")) return "perfil"
    return "inicio"
  }

  const activeTab = getActiveTab()

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isLoggedIn) router.push('/registro')
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%',
      transform: 'translateX(-50%)', width: '100%', maxWidth: 430,
      zIndex: 50, display: 'flex', alignItems: 'center',
      justifyContent: 'space-around',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
      paddingTop: 8, paddingBottom: 12,
    }}>

      <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
        <span style={{ fontSize: 22 }}>🏠</span>
        <span style={{ fontSize: 10, color: activeTab === 'inicio' ? '#fff' : 'rgba(255,255,255,0.4)' }}>Inicio</span>
      </Link>

      <Link href="/buscar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
        <span style={{ fontSize: 22 }}>🔍</span>
        <span style={{ fontSize: 10, color: activeTab === 'buscar' ? '#fff' : 'rgba(255,255,255,0.4)' }}>Buscar</span>
      </Link>

      <Link href="/publicar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', marginTop: -12 }}>
        <span style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#2563EB', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(37,99,235,0.5)',
        }}>+</span>
        <span style={{ fontSize: 10, color: activeTab === 'publicar' ? '#fff' : 'rgba(255,255,255,0.4)', marginTop: 2 }}>Publicar</span>
      </Link>

      <Link href="#" onClick={handleWhatsApp} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
        <span style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#25D366', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 20,
          boxShadow: '0 4px 12px rgba(37,211,102,0.4)',
        }}>📱</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>WhatsApp</span>
      </Link>

      <Link href="/perfil" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
        <span style={{ fontSize: 22 }}>👤</span>
        <span style={{ fontSize: 10, color: activeTab === 'perfil' ? '#fff' : 'rgba(255,255,255,0.4)' }}>Perfil</span>
      </Link>

    </nav>
  )
}