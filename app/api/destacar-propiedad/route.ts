import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { property_id, plan, precio } = await req.json()
    if (!property_id || !plan || !precio) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }
    if (Number(precio) <= 0 || Number(precio) > 999999) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 })
    }

    // Verificar que la propiedad pertenece al usuario
    const { data: prop } = await supabase
      .from("properties")
      .select("user_id")
      .eq("id", property_id)
      .single()
    if (!prop || prop.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    const dias = plan === "24h" ? 1 : 7

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: `Destacar propiedad ${plan}`,
            quantity: 1,
            unit_price: precio,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: `${process.env.APP_URL}/mis-publicaciones?destacado=1`,
          failure: `${process.env.APP_URL}/mis-publicaciones`,
          pending: `${process.env.APP_URL}/mis-publicaciones`,
        },
        auto_return: "approved",
        metadata: {
          type: "destacar",
          property_id,
          plan,
          dias,
        },
        notification_url: `${process.env.APP_URL}/api/webhook-mp`,
      }),
    })

    const mpData = await mpRes.json()
    if (!mpData.id) {
      return NextResponse.json({ error: "Error creando preferencia MercadoPago" }, { status: 500 })
    }

    return NextResponse.json({ init_point: mpData.init_point })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}