import { NextResponse, NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

const requireEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env var: ${key}`)
  return value
}

export async function POST(req: NextRequest) {
  try {
    const { propertyId, action } = await req.json()

    if (!propertyId || !["renovar", "pausar", "finalizar"].includes(action)) {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    }

    // Verificar que el usuario está autenticado
    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY")
    )

    // Traer la sesión del header Authorization
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verificar que el usuario es dueño de la propiedad
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar ownership
    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("id, user_id, listing_status")
      .eq("id", propertyId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (fetchError || !property) {
      return NextResponse.json({ error: "Propiedad no encontrada o no tienes permiso" }, { status: 404 })
    }

    let newStatus = ""
    let updateData: any = {}

    if (action === "renovar") {
      // Renovar: cambiar a activa y resetear tiempos de renovación
      newStatus = "activa"
      updateData = {
        listing_status: newStatus,
        last_confirmed_at: new Date().toISOString(),
        renewal_notified_at: null,
      }
    } else if (action === "pausar") {
      // Pausar: cambiar a pausada (no se elimina, solo desaparece del feed)
      newStatus = "pausada"
      updateData = {
        listing_status: newStatus,
      }
    } else if (action === "finalizar") {
      // Finalizar: marcar como vendida/alquilada
      newStatus = "finalizada"
      updateData = {
        listing_status: newStatus,
        renewal_notified_at: null,
      }
    }

    const { error: updateError } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", propertyId)

    if (updateError) throw updateError

    return NextResponse.json({
      ok: true,
      message: `Propiedad ${action === "renovar" ? "renovada" : action === "pausar" ? "pausada" : "finalizada"} exitosamente`,
      status: newStatus,
    })
  } catch (err: any) {
    console.error("Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
