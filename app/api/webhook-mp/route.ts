import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLANES_VENCIMIENTO: Record<string, number> = {
  junior: 30,
  agente: 30,
  especializado: 30,
  senior: 30,
}

const SERVICIOS_VIDEOS: Record<string, number> = {
  video_1: 1,
  video_5: 5,
  video_10: 10,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body
    if (type !== "payment") return NextResponse.json({ ok: true })

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    const payment = await response.json()

    if (payment.status !== "approved") return NextResponse.json({ ok: true })

    const planId = payment.metadata?.planId
    const userId = payment.metadata?.userId

    if (!userId || !planId) return NextResponse.json({ ok: true })

    // Es un plan de suscripcion
    if (PLANES_VENCIMIENTO[planId]) {
      const dias = PLANES_VENCIMIENTO[planId]
      const fechaVencimiento = new Date()
      fechaVencimiento.setDate(fechaVencimiento.getDate() + dias)
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        plan: planId,
        estado: "activo",
        mp_payment_id: String(paymentId),
        fecha_inicio: new Date().toISOString(),
        fecha_vencimiento: fechaVencimiento.toISOString(),
        precio_usd: payment.transaction_amount,
      }, { onConflict: "user_id" })
      return NextResponse.json({ ok: true })
    }

    // Es un servicio de videos adicionales
    if (SERVICIOS_VIDEOS[planId]) {
      const videosExtra = SERVICIOS_VIDEOS[planId]
      const { data: userData } = await supabase
        .from("users")
        .select("videos_extra")
        .eq("id", userId)
        .single()
      const actual = userData?.videos_extra || 0
      await supabase.from("users").update({
        videos_extra: actual + videosExtra
      }).eq("id", userId)
      await supabase.from("pagos_servicios").insert({
        user_id: userId,
        servicio: planId,
        mp_payment_id: String(paymentId),
        precio: payment.transaction_amount,
        fecha: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true })
    }

    // Otros servicios
    await supabase.from("pagos_servicios").insert({
      user_id: userId,
      servicio: planId,
      mp_payment_id: String(paymentId),
      precio: payment.transaction_amount,
      fecha: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}