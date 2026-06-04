import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const rateLimit = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 20
  const current = rateLimit.get(ip)
  if (!current || now > current.reset) {
    rateLimit.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (current.count >= maxRequests) return false
  current.count++
  return true
}

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
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Demasiadas peticiones." }, { status: 429 })
    }
// Verificar firma de MercadoPago
    const secret = process.env.MP_WEBHOOK_SECRET
    if (secret) {
      const xSignature = req.headers.get("x-signature")
      const xRequestId = req.headers.get("x-request-id")
      const url = new URL(req.url)
      const dataId = url.searchParams.get("data.id") || ""
      if (xSignature) {
        const parts = xSignature.split(",")
        let ts = ""
        let v1 = ""
        for (const part of parts) {
          const [key, val] = part.trim().split("=")
          if (key === "ts") ts = val
          if (key === "v1") v1 = val
        }
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
        const encoder = new TextEncoder()
        const keyData = encoder.encode(secret)
        const msgData = encoder.encode(manifest)
        const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
        const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData)
        const hashHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("")
        if (hashHex !== v1) {
          console.error("Firma MP inválida")
          return NextResponse.json({ error: "Firma inválida" }, { status: 401 })
        }
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

    const planId = payment.metadata?.planId
    const userId = payment.metadata?.userId
    // Si es un destacado
    const tipoDestacado = payment.metadata?.type
    if (tipoDestacado === "destacar") {
      const propertyId = payment.metadata?.property_id
      const dias = payment.metadata?.dias || 1
      const hasta = new Date()
      hasta.setDate(hasta.getDate() + dias)
      await supabase.from("properties").update({
        highlighted: true,
        highlighted_until: hasta.toISOString(),
      }).eq("id", propertyId)
      return NextResponse.json({ ok: true })
    }

   // Si es una reserva
    const reservaPropertyId = payment.metadata?.property_id
    if (reservaPropertyId) {
      const { data: reservaActualizada } = await supabase.from("reservas")
        .update({ estado: "confirmada", mp_payment_id: String(paymentId) })
        .eq("mp_payment_id", String(payment.order?.id || paymentId))
        .select()
        .single()

      if (reservaActualizada?.id) {
        // Notificar al dueño
        await fetch(`${process.env.APP_URL}/api/notificar-reserva`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reserva_id: reservaActualizada.id }),
        })

        // Distribuir comisiones por la red
        const { data: propData } = await supabase
          .from("properties")
          .select("user_id")
          .eq("id", reservaPropertyId)
          .maybeSingle()

        if (propData?.user_id && payment.transaction_amount) {
          await distribuirComisiones(
            reservaActualizada.id,
            payment.transaction_amount,
            propData.user_id
          )
        }
      }

      return NextResponse.json({ ok: true })
    }

    if (!userId || !planId) return NextResponse.json({ ok: true })

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
async function distribuirComisiones(reservaId: string, montoTotal: number, propertyUserId: string) {
  const porcentajes: Record<number, number> = {
    1: 0.8, 2: 0.4, 3: 0.2, 4: 0.1
  }
  const pctViviendaya = 3.0
  const pctAgente = 2.0
  const montoViviendaya = montoTotal * pctViviendaya / 100
  const montoAgente = montoTotal * pctAgente / 100

  await supabase.from("red_comisiones").insert({
    reserva_id: reservaId,
    beneficiario_id: propertyUserId,
    origen_id: propertyUserId,
    nivel: 0,
    porcentaje: pctAgente,
    monto: montoAgente,
    tipo: "reserva",
    estado: "pendiente",
  })

  let currentUserId = propertyUserId
  let nivel = 1

  while (nivel <= 10) {
    const { data: userData } = await supabase
      .from("users")
      .select("referido_por")
      .eq("id", currentUserId)
      .maybeSingle()

    if (!userData?.referido_por) break

    const pct = nivel <= 4 ? porcentajes[nivel] : 0.05
    const monto = montoTotal * pct / 100

    await supabase.from("red_comisiones").insert({
      reserva_id: reservaId,
      beneficiario_id: userData.referido_por,
      origen_id: propertyUserId,
      nivel,
      porcentaje: pct,
      monto,
      tipo: "reserva",
      estado: "pendiente",
    })

    currentUserId = userData.referido_por
    nivel++
  }
}
