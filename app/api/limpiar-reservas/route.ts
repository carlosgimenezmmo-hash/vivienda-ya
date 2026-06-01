import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // Verificar que viene del cron de Vercel
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Cancelar reservas pendientes con más de 30 minutos
    const treintaMinutosAtras = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from("reservas")
      .update({ estado: "cancelada" })
      .eq("estado", "pendiente")
      .lt("created_at", treintaMinutosAtras)
      .select()

    if (error) throw error

    console.log(`Reservas canceladas: ${data?.length || 0}`)
    return NextResponse.json({ ok: true, canceladas: data?.length || 0 })
  } catch (err: any) {
    console.error("Error limpiar reservas:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}