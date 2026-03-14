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

  const active = pathname === "/" ? "inicio" : pathname.startsWith("/buscar") ? "buscar" : pathname.startsWith("/publicar") ? "publicar" : pathname.startsWith("/perfil") ? "perfil" : "inicio"

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      setShowSheet(true)
      return
    }
    if (!activeProperty?.whatsapp_number) {
      alert("Esta propiedad no tiene WhatsApp de contacto")
      return
    }
    const clean = activeProperty.whatsapp_number.replace(/\D/g, '')
    const msg = `Hola! Vi "${activeProperty.title}" en ViviendaYa y me interesa. Podes darme mas info?`

