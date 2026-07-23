import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireEnv } from "@/lib/utils"
import { Resend } from "resend"

const resend = new Resend(requireEnv("RESEND_API_KEY"))

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-internal-secret")
    const internalSecret = requireEnv("INTERNAL_API_SECRET")
    if (secret !== internalSecret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { reserva_id, estado } = await req.json()
    if (!reserva_id) return NextResponse.json({ error: "Falta reserva_id" }, { status: 400 })

    const { data: reserva } = await supabaseAdmin
      .from("reservas")
      .select("*, properties(title, neighborhood, city)")
      .eq("id", reserva_id)
      .single()
    if (!reserva || !reserva.user_id) return NextResponse.json({ ok: true })

    const { data: huesped } = await supabaseAdmin
      .from("users")
      .select("name, email")
      .eq("id", reserva.user_id)
      .single()
    if (!huesped?.email) return NextResponse.json({ ok: true })

    const esConfirmada = estado === "confirmada"

    const emailBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: ${esConfirmada ? '#22C55E' : '#EF4444'}; margin: 0 0 8px;">
          ${esConfirmada ? 'Reserva confirmada' : 'Reserva cancelada'}
        </h1>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 16px; font-size: 18px;">${reserva.properties?.title}</h2>
          <p style="margin: 0 0 8px; color: #666;">${reserva.properties?.neighborhood}, ${reserva.properties?.city}</p>
          <p style="margin: 0 0 8px; color: #666;">Entrada: <strong>${reserva.fecha_desde}</strong></p>
          <p style="margin: 0 0 8px; color: #666;">Salida: <strong>${reserva.fecha_hasta}</strong></p>
          <p style="margin: 0 0 8px; color: #666;">Noches: <strong>${reserva.noches}</strong></p>
          <p style="margin: 0; font-size: 20px; font-weight: 800; color: #22C55E;">Total: USD ${Number(reserva.precio_total).toFixed(2)}</p>
        </div>
        ${esConfirmada
          ? '<p style="color: #666; font-size: 13px;">El propietario confirmo tu reserva. Podes ver los detalles en ViviendaYa.</p>'
          : '<p style="color: #666; font-size: 13px;">Lamentablemente el propietario cancelo tu reserva. Te recomendamos buscar otra opcion en ViviendaYa.</p>'
        }
      </div>
    `

    await resend.emails.send({
      from: "ViviendaYa <notificaciones@viviendaya.com>",
      to: huesped.email,
      subject: `Reserva ${estado} - ${reserva.properties?.title}`,
      html: emailBody,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Error notificacion huesped:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
