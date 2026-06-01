import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json()
    if (!user_id) return NextResponse.json({ error: "Falta user_id" }, { status: 400 })

    // Borrar datos del usuario en orden
    await supabase.from("saved_properties").delete().eq("user_id", user_id)
    await supabase.from("reservas").delete().eq("user_id", user_id)
    await supabase.from("subscriptions").delete().eq("user_id", user_id)
    await supabase.from("comments").delete().eq("user_id", user_id)
    await supabase.from("properties").delete().eq("user_id", user_id)
    await supabase.from("users").delete().eq("id", user_id)

    // Eliminar el usuario de Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}