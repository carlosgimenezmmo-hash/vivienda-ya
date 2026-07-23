import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireEnv } from "@/lib/utils"

const geminiApiKey = requireEnv("GEMINI_API_KEY")


export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Ruta deshabilitada" }, { status: 403 })
  try {
    const { propertyId, videoUrl } = await req.json()
    if (!propertyId || !videoUrl) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Sos un moderador de contenido para una app inmobiliaria argentina.
Analizá esta URL de video de una propiedad: ${videoUrl}

Respondé SOLO con un JSON sin markdown:
{"status": "approved", "reason": "Video de propiedad normal"}
o
{"status": "pending", "reason": "Motivo de revisión"}
o
{"status": "rejected", "reason": "Motivo de rechazo"}

Rechazá solo si hay contenido sexual, violento u ofensivo obvio.
Marcá como pending si no podés analizar o hay algo dudoso.
Aprobá si parece un video normal de propiedad inmobiliaria.`
            }]
          }]
        }),
      }
    )

    const aiData = await response.json()
    const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{"status":"approved","reason":"Auto-aprobado"}'

    let result
    try {
      result = JSON.parse(text.replace(/```json|```/g, "").trim())
    } catch {
      result = { status: "approved", reason: "Auto-aprobado" }
    }

    await supabaseAdmin
      .from("properties")
      .update({ status: result.status })
      .eq("id", propertyId)

    return NextResponse.json({ ok: true, result })
  } catch (err: any) {
    console.error("Error moderacion:", err)
    // En caso de error, aprobamos para no bloquear al usuario
    if (req.body) {
      const { propertyId } = await req.json().catch(() => ({}))
      if (propertyId) {
        await supabaseAdmin.from("properties").update({ status: "approved" }).eq("id", propertyId)
      }
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
