import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLANES_VENCIMIENTO: Record<string, number> = {
  starter: 30,
  pro: 30,
  elite: 30,
  servicio: 0,
}

export async function POST(req: NextRequest) {
  try {
    console.log("WEBHOOK RECIBIDO:", new Date().toISOString())
    const body = await req.json()
    console.log("BODY:", JSON.stringify(body))
    const { type, data } = body

    if (type !== "payment") return NextResponse.json({ ok: true })

    const paymentId = data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    const payment = await response.json()
    console.log("PAYMENT STATUS:", payment.status)
    console.log("PAYMENT METADATA:", JSON.stringify(payment.metadata))

    if (payment.status !== "approved") return NextResponse.json({ ok: true })

    const planId = payment.metadata?.planId || "servicio"
    const userId = payment.metadata?.userId

    if (!userId || planId === "servicio") return NextResponse.json({ ok: true })

    const dias = PLANES_VENCIMIENTO[planId] || 30
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

    console.log("SUBSCRIPTION GUARDADA:", userId, planId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
