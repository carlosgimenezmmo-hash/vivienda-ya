import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-internal-secret")
    if (secret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { reserva_id } = await req.json()
    if (!reserva_id) return NextResponse.json({ error: "Falta reserva_id" }, { status: 400 })

    // Traer datos de la reserva
    const { data: reserva } = await supabase
      .from("reservas")
      .select("*, properties(title, neighborhood, city, user_id, whatsapp_number)")
      .eq("id", reserva_id)
      .single()

    if (!reserva) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })

    const propertyOwnerId = reserva.properties?.user_id
    if (!propertyOwnerId) return NextResponse.json({ ok: true })

    // Traer preferencias del dueño
    const { data: ownerData } = await supabase
      .from("users")
      .select("notification_preference, notification_email, notification_whatsapp, name")
      .eq("id", propertyOwnerId)
      .single()

    if (!ownerData) return NextResponse.json({ ok: true })

    const preference = ownerData.notification_preference || "email"
    const ownerName = ownerData.name || "Propietario"

    const emailBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #2563EB; margin: 0 0 8px;">Nueva reserva recibida 🎉</h1>
        <p style="color: #666; margin: 0 0 24px;">Hola ${ownerName}, recibiste una nueva reserva en ViviendaYa.</p>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 16px; font-size: 18px;">${reserva.properties?.title}</h2>
          <p style="margin: 0 0 8px; color: #666;">📍 ${reserva.properties?.neighborhood}, ${reserva.properties?.city}</p>
          <p style="margin: 0 0 8px; color: #666;">📅 Entrada: <strong>${reserva.fecha_desde}</strong></p>
          <p style="margin: 0 0 8px; color: #666;">📅 Salida: <strong>${reserva.fecha_hasta}</strong></p>
          <p style="margin: 0 0 8px; color: #666;">🌙 Noches: <strong>${reserva.noches}</strong></p>
          <p style="margin: 0; font-size: 20px; font-weight: 800; color: #22C55E;">Total: USD ${Number(reserva.precio_total).toFixed(2)}</p>
        </div>

        <p style="color: #666; font-size: 13px;">Ingresá a ViviendaYa para confirmar o cancelar la reserva.</p>
      </div>
    `

    // Enviar email
    if (preference === "email" || preference === "ambos") {
      const emailTo = ownerData.notification_email
      if (emailTo) {
        await resend.emails.send({
          from: "ViviendaYa <notificaciones@viviendaya.com>",
          to: emailTo,
          subject: `Nueva reserva — ${reserva.properties?.title}`,
          html: emailBody,
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Error notificacion:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}