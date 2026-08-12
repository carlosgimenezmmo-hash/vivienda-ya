import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const SITE_URL = "https://vivienda-ya.vercel.app"

export async function GET(req: Request) {
  // Verificar token de seguridad para que nadie más pueda disparar este endpoint
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const ahora = new Date()
  const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const hace24hs = new Date(ahora.getTime() - 24 * 60 * 60 * 1000).toISOString()

  let notificadas = 0
  let pausadas = 0

  try {
    // 1) Pausar las que ya fueron notificadas hace más de 24hs y no respondieron
    const { data: aPausar, error: errorPausar } = await supabase
      .from("properties")
      .select("id")
      .eq("listing_status", "activa")
      .not("renewal_notified_at", "is", null)
      .lte("renewal_notified_at", hace24hs)

    if (errorPausar) throw errorPausar

    if (aPausar && aPausar.length > 0) {
      const ids = aPausar.map((p) => p.id)
      const { error: updateError } = await supabase
        .from("properties")
        .update({ listing_status: "pausada_inactividad" })
        .in("id", ids)
      if (updateError) throw updateError
      pausadas = ids.length
    }

    // 2) Notificar a las que llevan más de 7 días sin confirmar y todavía no fueron avisadas
    const { data: aNotificar, error: errorNotificar } = await supabase
      .from("properties")
      .select("id, title, user_id, renewal_token")
      .eq("listing_status", "activa")
      .is("renewal_notified_at", null)
      .lte("last_confirmed_at", hace7dias)

    if (errorNotificar) throw errorNotificar

   for (const prop of aNotificar || []) {
      if (!prop.user_id) continue

      const { data: userData } = await supabase.auth.admin.getUserById(prop.user_id)
      const email = userData?.user?.email
      if (!email) continue

      // Si por algún motivo no tiene token generado, lo creamos ahora como respaldo
      let token = prop.renewal_token
      if (!token) {
        const { data: updated } = await supabase
          .from("properties")
          .update({ renewal_token: crypto.randomUUID() })
          .eq("id", prop.id)
          .select("renewal_token")
          .single()
        token = updated?.renewal_token
      }

      const link = `${SITE_URL}/renovar/${token}`
      await resend.emails.send({
        from: "ViviendaYa <notificaciones@viviendaya.com.ar>",
        to: email,
        subject: `¿"${prop.title}" sigue disponible?`,
        html: `
          <p>Hola,</p>
          <p>Tu publicación <strong>${prop.title}</strong> lleva una semana activa en ViviendaYa.</p>
          <p>Contanos si sigue disponible tocando el siguiente link:</p>
          <p><a href="${link}">${link}</a></p>
          <p>Si no respondés en 24hs, la publicación se pausa automáticamente para no mostrar propiedades desactualizadas. Podés reactivarla en cualquier momento confirmando desde ese mismo link.</p>
        `,
      })

      await supabase
        .from("properties")
        .update({ renewal_notified_at: ahora.toISOString() })
        .eq("id", prop.id)

      notificadas++
    }

    return NextResponse.json({ ok: true, notificadas, pausadas })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}