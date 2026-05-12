"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function AuthHandler() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      // Esperar a que Supabase procese el hash/code
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        // Escuchar el evento de login
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            subscription.unsubscribe()
            await checkAndRedirect(session.user)
          }
        })
        return
      }

      await checkAndRedirect(session.user)
    }

    const checkAndRedirect = async (user: any) => {
      const { data: existing } = await supabase
        .from("users")
        .select("id, phone")
        .eq("id", user.id)
        .single()

      if (!existing) {
        // Crear usuario nuevo
        const nombre = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario"
        const slug = nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + user.id.slice(0, 6)

        await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          full_name: nombre,
          avatar_url: user.user_metadata?.avatar_url || null,
          credits: 101,
        })

        await supabase.from("channels").insert({
          user_id: user.id,
          slug,
          nombre,
          plan: "gratis",
          verificado: false,
        })

        const ahora = new Date()
        const vencimiento = new Date()
        vencimiento.setDate(vencimiento.getDate() + 30)

        await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan: "senior",
          estado: "activo",
          fecha_inicio: ahora.toISOString(),
          fecha_vencimiento: vencimiento.toISOString(),
          precio_usd: 0,
        })

        router.push("/bienvenida")
        return
      }

      if (!existing.phone) {
        router.push("/bienvenida")
        return
      }

      router.push("/feed")
    }

    handle()
  }, [])

  return (
    <div style={{
      minHeight: "100dvh", background: "#0a0a0a", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>Iniciando sesión...</p>
    </div>
  )
}