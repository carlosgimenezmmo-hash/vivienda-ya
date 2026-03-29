import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

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
    const secret = process.env.MP_WEBHOOK_SECRET
    if (secret) {
      const signature = req.headers.get("x-signature") || ""
      const requestId = req.headers.get("x-request-id") || ""
      const dataId = req.nextUrl.searchParams.get("data.id") || ""
      const signedTemplate = `id:${dataId};request-id:${requestId};ts:${signature.split("ts=")[1]?.split(",")[0]};`
      const hash = crypto.createHmac("sha256", secret).update(signedTemplate).digest("hex")
      const v1 = signature.split("v1=")[1]
      if (v1 && hash !== v1) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

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

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
