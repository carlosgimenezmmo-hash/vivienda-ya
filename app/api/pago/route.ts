import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const { createClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

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
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
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
          success: "https://vivienda-ya.vercel.app/planes?pago=ok",
          failure: "https://vivienda-ya.vercel.app/planes?pago=error",
          pending: "https://vivienda-ya.vercel.app/planes?pago=pendiente",
        },
        auto_return: "approved",
        metadata: { planId, userId },
        external_reference: `${userId}-${planId}-${Date.now()}`,
        notification_url: "https://vivienda-ya.vercel.app/api/webhook-mp",
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