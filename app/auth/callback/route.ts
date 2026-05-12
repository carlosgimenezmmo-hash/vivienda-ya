import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/feed", req.url))
  }

  // Cliente con service role para operaciones de DB
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Intercambiar el code por tokens
  const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify({ auth_code: code }),
  })

  const tokenData = await tokenRes.json()

  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL("/feed", req.url))
  }

  // Obtener el usuario con el access token
  const userRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      "Authorization": `Bearer ${tokenData.access_token}`,
      "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
  })

  const userData = await userRes.json()
  const user = userData

  if (!user?.id) {
    return NextResponse.redirect(new URL("/feed", req.url))
  }

  // Verificar si ya existe en la tabla users
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id, phone")
    .eq("id", user.id)
    .single()

  let isNew = false

  if (!existing) {
    isNew = true
    const nombre = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario"
    const slug = nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + user.id.slice(0, 6)

    await supabaseAdmin.from("users").insert({
      id: user.id,
      email: user.email,
      full_name: nombre,
      avatar_url: user.user_metadata?.avatar_url || null,
      credits: 101,
    })

    await supabaseAdmin.from("channels").insert({
      user_id: user.id,
      slug,
      nombre,
      plan: "gratis",
      verificado: false,
    })

    const ahora = new Date()
    const vencimiento = new Date()
    vencimiento.setDate(vencimiento.getDate() + 30)

    await supabaseAdmin.from("subscriptions").insert({
      user_id: user.id,
      plan: "senior",
      estado: "activo",
      fecha_inicio: ahora.toISOString(),
      fecha_vencimiento: vencimiento.toISOString(),
      precio_usd: 0,
    })
  }

  // Armar respuesta con cookies de sesión
  const destination = (isNew || !existing?.phone) ? "/bienvenida" : "/feed"
  const response = NextResponse.redirect(new URL(destination, req.url))

  // Guardar tokens en cookies para que el cliente los use
  response.cookies.set("sb-access-token", tokenData.access_token, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    maxAge: tokenData.expires_in || 3600,
    path: "/",
  })

  if (tokenData.refresh_token) {
    response.cookies.set("sb-refresh-token", tokenData.refresh_token, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })
  }

  return response
}