import { NextRequest, NextResponse } from "next/server"
import { parseBearerToken } from "@/lib/utils"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = parseBearerToken(authHeader)
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { user_id } = await req.json()
    if (!user_id) return NextResponse.json({ error: "Falta user_id" }, { status: 400 })
    if (user.id !== user_id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    // Borrar datos del usuario en orden
    await supabaseAdmin.from("saved_properties").delete().eq("user_id", user_id)
    await supabaseAdmin.from("reservas").delete().eq("user_id", user_id)
    await supabaseAdmin.from("subscriptions").delete().eq("user_id", user_id)
    await supabaseAdmin.from("comments").delete().eq("user_id", user_id)
    await supabaseAdmin.from("properties").delete().eq("user_id", user_id)
    await supabaseAdmin.from("users").delete().eq("id", user_id)

    // Eliminar el usuario de Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}