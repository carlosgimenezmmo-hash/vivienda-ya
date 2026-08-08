import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
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
      .select("id")
      .eq("renewal_token", token)
      .maybeSingle()

    if (findError || !property) {
      return NextResponse.json({ error: "Link inválido o expirado" }, { status: 404 })
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
    } else {
      // Vendida o alquilada: se da de baja de forma definitiva
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          listing_status: "finalizada",
        })
        .eq("id", property.id)

      if (updateError) throw updateError
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}