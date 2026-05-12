import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user

      const { data: existing } = await supabase
        .from("users")
        .select("id, phone")
        .eq("id", user.id)
        .single()

      if (!existing) {
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

        // Usuario nuevo → bienvenida
        return NextResponse.redirect(new URL("/bienvenida", req.url))
      }

      // Usuario existente sin teléfono → bienvenida
      if (!existing.phone) {
        return NextResponse.redirect(new URL("/bienvenida", req.url))
      }
    }
  }

  return NextResponse.redirect(new URL("/feed", req.url))
}