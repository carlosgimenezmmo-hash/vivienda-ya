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

    const { titulo, precio, planId, userId } = await req.json()
    if (user.id !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    if (!titulo || !precio || !planId || !userId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }
    if (Number(precio) <= 0 || Number(precio) > 9999999) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 })
    }
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            id: planId,
            title: titulo,
            description: titulo,
            category_id: "services",
            quantity: 1,
            unit_price: Number(precio),
            currency_id: "ARS",
          },
        ],
        payment_methods: {
          excluded_payment_types: [],
          excluded_payment_methods: [],
          installments: 12,
        },
        back_urls: {
          success: `${appUrl}/planes?pago=ok`,
          failure: `${appUrl}/planes?pago=error`,
          pending: `${appUrl}/planes?pago=pendiente`,
        },
        auto_return: "approved",
        metadata: { planId, userId },
        external_reference: `${userId}-${planId}-${Date.now()}`,
        notification_url: `${appUrl}/api/webhook-mp`,
      }),
    })
    const data = await response.json()
    if (!data.init_point) {
      return NextResponse.json({ error: "Error al crear preferencia" }, { status: 500 })
    }
    return NextResponse.json({ url: data.init_point })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}