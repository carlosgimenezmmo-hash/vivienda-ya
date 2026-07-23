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

    const { property_id, plan, precio } = await req.json()
    if (!property_id || !plan || !precio) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }
    if (Number(precio) <= 0 || Number(precio) > 999999) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 })
    }

    // Verificar que la propiedad pertenece al usuario
    const { data: prop } = await supabaseAdmin
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
        Authorization: `Bearer ${mpAccessToken}`,
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
          success: `${appUrl}/mis-publicaciones?destacado=1`,
          failure: `${appUrl}/mis-publicaciones`,
          pending: `${appUrl}/mis-publicaciones`,
        },
        auto_return: "approved",
        metadata: {
          type: "destacar",
          property_id,
          plan,
          dias,
        },
        notification_url: `${appUrl}/api/webhook-mp`,
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