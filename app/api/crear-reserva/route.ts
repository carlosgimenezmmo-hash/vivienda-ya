import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { property_id, user_id, fecha_desde, fecha_hasta, noches, precio_total, comision } = body

    if (!property_id || !fecha_desde || !fecha_hasta || !precio_total) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    // Crear preferencia en MercadoPago
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: `Reserva propiedad #${property_id}`,
            quantity: 1,
            unit_price: parseFloat(precio_total),
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/reservas-confirmadas`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/reservar?id=${property_id}&error=1`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/reservas-confirmadas`,
        },
        auto_return: "approved",
        metadata: {
          property_id,
          user_id,
          fecha_desde,
          fecha_hasta,
          noches,
          precio_total,
          comision,
        },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook-mp`,
      }),
    })

    const mpData = await mpRes.json()

    if (!mpData.id) {
      return NextResponse.json({ error: "Error creando preferencia MercadoPago" }, { status: 500 })
    }

    // Guardar reserva en Supabase con estado pendiente
    const { data: reserva, error: insertError } = await supabase.from("reservas").insert({
      property_id,
      user_id: user_id || null,
      fecha_desde,
      fecha_hasta,
      noches,
      precio_total,
      comision,
      estado: "pendiente",
      mp_payment_id: mpData.id,
    }).select().single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      preference_id: mpData.id,
      init_point: mpData.init_point,
      reserva_id: reserva.id,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}