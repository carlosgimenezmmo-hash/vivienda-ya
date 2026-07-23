import { NextRequest, NextResponse } from "next/server"
import { parseBearerToken, requireEnv } from "@/lib/utils"
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

    const mpAccessToken = requireEnv("MP_ACCESS_TOKEN")
    const appUrl = requireEnv("APP_URL")

    const body = await req.json()
    const { property_id, fecha_desde, fecha_hasta, noches, precio_total, comision } = body
    const user_id = user.id

    if (!property_id || !fecha_desde || !fecha_hasta || !precio_total) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }
    if (Number(precio_total) <= 0 || Number(precio_total) > 99999999) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 })
    }
// Verificar que no haya reservas confirmadas que se superpongan
    const { data: reservasExistentes } = await supabaseAdmin
      .from("reservas")
      .select("id")
      .eq("property_id", property_id)
      .in("estado", ["confirmada", "pendiente"])
      .or(`and(fecha_desde.lte.${fecha_hasta},fecha_hasta.gte.${fecha_desde})`)

    if (reservasExistentes && reservasExistentes.length > 0) {
      return NextResponse.json({ error: "Las fechas seleccionadas ya están reservadas. Por favor elegí otras fechas." }, { status: 409 })
    }
    // Crear preferencia en MercadoPago
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken}`,
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
          success: `${appUrl}/reservas-confirmadas`,
          failure: `${appUrl}/reservar?id=${property_id}&error=1`,
          pending: `${appUrl}/reservas-confirmadas`,
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
        notification_url: `${appUrl}/api/webhook-mp`,
      }),
    })

    const mpData = await mpRes.json()

    if (!mpData.id) {
      return NextResponse.json({ error: "Error creando preferencia MercadoPago" }, { status: 500 })
    }

    // Guardar reserva en Supabase con estado pendiente
    const { data: reserva, error: insertError } = await supabaseAdmin.from("reservas").insert({
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