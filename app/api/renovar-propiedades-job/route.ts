import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { v4 as uuidv4 } from "uuid"

const requireEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env var: ${key}`)
  return value
}

const resend = new Resend(requireEnv("RESEND_API_KEY"))

export const maxDuration = 60

export async function GET(req: Request) {
  try {
    // Verificar token de seguridad (Vercel Cron)
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY")
    )

    // Buscar propiedades activas que fueron publicadas hace más de 7 días
    // y no han sido notificadas en los últimos 7 días
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: properties, error: fetchError } = await supabase
      .from("properties")
      .select("id, title, user_id, created_at, renewal_notified_at, renewal_token")
      .eq("listing_status", "activa")
      .lt("created_at", sevenDaysAgo.toISOString())
      .or(`renewal_notified_at.is.null,renewal_notified_at.lt.${sevenDaysAgo.toISOString()}`)

    if (fetchError) throw fetchError

    if (!properties || properties.length === 0) {
      return NextResponse.json({ ok: true, count: 0 })
    }

    let notifiedCount = 0
    let errorCount = 0

    for (const property of properties) {
      try {
        // Generar token único si no existe
        const token = property.renewal_token || uuidv4()

        // Traer datos del propietario
        const { data: owner } = await supabase
          .from("users")
          .select("email, name, notification_email, notification_preference")
          .eq("id", property.user_id)
          .single()

        if (!owner?.email && !owner?.notification_email) {
          console.log(`No email for property ${property.id}`)
          continue
        }

        const recipientEmail = owner.notification_email || owner.email
        const ownerName = owner.name || "Propietario"

        // Generar link de renovación
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://viviendaya.com"
        const renewalLink = `${appUrl}/renovar/${token}`

        // Preparar email
        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
            <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              
              <h1 style="color: #0a0a0a; font-size: 24px; margin: 0 0 16px; font-weight: 700;">Tu propiedad necesita renovación</h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
                Hola <strong>${ownerName}</strong>,
              </p>

              <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
                Tu propiedad <strong>"${property.title}"</strong> ha estado publicada por más de 7 días.
              </p>

              <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0 0 32px;">
                ¿Sigue disponible? Confirma que aún la querés publicar o marca como vendida/alquilada.
              </p>

              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${renewalLink}?action=confirm" style="display: inline-block; background: #22C55E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 12px; font-size: 16px;">
                  ✓ Sigue disponible
                </a>
                <a href="${renewalLink}?action=done" style="display: inline-block; background: #6B7280; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  ✗ Ya se vendió
                </a>
              </div>

              <div style="background: #f0f9ff; border-left: 4px solid #3B82F6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>⏰ Importante:</strong> Si no confirmas en 24 horas, tu propiedad se dará de baja automáticamente del feed.
                </p>
              </div>

              <p style="color: #999; font-size: 13px; text-align: center; margin: 0;">
                Si no ves los botones, copia y pega este link en tu navegador: <br>
                <span style="word-break: break-all; font-family: monospace;">${renewalLink}</span>
              </p>

            </div>
          </div>
        `

        // Enviar email
        await resend.emails.send({
          from: "ViviendaYa <notificaciones@viviendaya.com>",
          to: recipientEmail,
          subject: "Tu propiedad necesita renovación",
          html: emailHtml,
        })

        // Actualizar propiedad con token y timestamp de notificación
        await supabase
          .from("properties")
          .update({
            renewal_token: token,
            renewal_notified_at: new Date().toISOString(),
          })
          .eq("id", property.id)

        notifiedCount++
      } catch (err: any) {
        console.error(`Error processing property ${property.id}:`, err)
        errorCount++
      }
    }

    // Verificar propiedades que no fueron confirmadas en 24h y darlas de baja
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { data: expiredProps } = await supabase
      .from("properties")
      .select("id")
      .eq("listing_status", "activa")
      .not("renewal_notified_at", "is", null)
      .lt("renewal_notified_at", twentyFourHoursAgo.toISOString())
      .is("last_confirmed_at", null)

    let deactivatedCount = 0
    if (expiredProps && expiredProps.length > 0) {
      for (const prop of expiredProps) {
        try {
          await supabase
            .from("properties")
            .update({ listing_status: "inactiva_por_renovacion" })
            .eq("id", prop.id)
          deactivatedCount++
        } catch (err) {
          console.error(`Error deactivating property ${prop.id}:`, err)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      notified: notifiedCount,
      errors: errorCount,
      deactivated: deactivatedCount,
    })
  } catch (err: any) {
    console.error("Cron job error:", err)
    return NextResponse.json(
      { error: err.message, ok: false },
      { status: 500 }
    )
  }
}
