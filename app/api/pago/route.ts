import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { titulo, precio, planId, userId } = await req.json()
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