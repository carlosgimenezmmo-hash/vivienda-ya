import { NextResponse, NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const { token, action } = await req.json()

    if (!token || !["confirmar", "finalizar"].includes(action)) {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar la propiedad por su token único (no requiere login)
    const { data: property, error: findError } = await supabase
      .from("properties")
      .select("id, listing_status, renewal_notified_at")
      .eq("renewal_token", token)
      .maybeSingle()

    if (findError || !property) {
      return NextResponse.json({ error: "Link inválido o expirado" }, { status: 404 })
    }

    // Verificar que el link no haya expirado (24 horas)
    if (property.renewal_notified_at) {
      const notifiedTime = new Date(property.renewal_notified_at).getTime()
      const now = new Date().getTime()
      const hoursDiff = (now - notifiedTime) / (1000 * 60 * 60)
      
      if (hoursDiff > 24) {
        return NextResponse.json({ 
          error: "El link de renovación ha expirado (máximo 24 horas)" 
        }, { status: 400 })
      }
    }

    if (action === "confirmar") {
      // Sigue disponible: resetea el contador de inactividad
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          last_confirmed_at: new Date().toISOString(),
          renewal_notified_at: null,
          listing_status: "activa",
        })
        .eq("id", property.id)

      if (updateError) throw updateError

      return NextResponse.json({ 
        ok: true, 
        message: "Propiedad renovada exitosamente",
        status: "confirmed"
      })
    } else if (action === "finalizar") {
      // Vendida o alquilada: se da de baja de forma definitiva
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          listing_status: "finalizada",
          renewal_notified_at: null,
        })
        .eq("id", property.id)

      if (updateError) throw updateError

      return NextResponse.json({ 
        ok: true, 
        message: "Propiedad marcada como finalizada",
        status: "finished"
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET para verificar estado del token (útil para el frontend)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: property, error } = await supabase
      .from("properties")
      .select("id, title, renewal_notified_at, listing_status")
      .eq("renewal_token", token)
      .maybeSingle()

    if (error || !property) {
      return NextResponse.json({ error: "Token inválido" }, { status: 404 })
    }

    // Verificar expiración
    let isExpired = false
    if (property.renewal_notified_at) {
      const notifiedTime = new Date(property.renewal_notified_at).getTime()
      const now = new Date().getTime()
      const hoursDiff = (now - notifiedTime) / (1000 * 60 * 60)
      isExpired = hoursDiff > 24
    }

    return NextResponse.json({
      ok: true,
      property: {
        id: property.id,
        title: property.title,
        status: property.listing_status,
      },
      isExpired,
      expiresAt: property.renewal_notified_at ? 
        new Date(new Date(property.renewal_notified_at).getTime() + 24 * 60 * 60 * 1000).toISOString() :
        null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}