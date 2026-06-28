import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const rateLimit = new Map<string, { count: number; reset: number }>()
function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const maxRequests = 10
  const current = rateLimit.get(userId)
  if (!current || now > current.reset) {
    rateLimit.set(userId, { count: 1, reset: now + windowMs })
    return true
  }
  if (current.count >= maxRequests) return false
  current.count++
  return true
}

  export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Ruta deshabilitada" }, { status: 403 })
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
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("estado", "activo")
      .maybeSingle()
    if (!sub) {
      return NextResponse.json({ error: "Necesitas un plan activo para procesar videos" }, { status: 403 })
    }
    if (!checkRateLimit(user.id)) {
      return NextResponse.json({ error: "Limite de procesamiento alcanzado. Intenta en 1 hora." }, { status: 429 })
    }

    const { videoUrl, modo } = await req.json()
    if (!videoUrl) return NextResponse.json({ error: "Video requerido" }, { status: 400 })

    const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        "Authorization": process.env.ASSEMBLYAI_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: videoUrl,
        language_code: "es",
        auto_highlights: true,
      }),
    })
    const transcript = await transcriptRes.json()
    const transcriptId = transcript.id

    let subtitulos = ""
    let intentos = 0
    while (intentos < 30) {
      await new Promise(r => setTimeout(r, 3000))
      const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { "Authorization": process.env.ASSEMBLYAI_API_KEY! },
      })
      const status = await statusRes.json()
      if (status.status === "completed") {
        subtitulos = status.text || ""
        break
      }
      if (status.status === "error") break
      intentos++
    }

    let descripcionIA = ""
    if (modo === "completo" && subtitulos) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Sos un experto inmobiliario argentino. Basandote en esta transcripcion de un video de propiedad, escribi una descripcion profesional y atractiva de maximo 150 caracteres para publicar en un marketplace inmobiliario: "${subtitulos}"`
              }]
            }]
          })
        }
      )
      const geminiData = await geminiRes.json()
      descripcionIA = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    }

    return NextResponse.json({ ok: true, subtitulos, descripcionIA, transcriptId })
  } catch (err: any) {
    console.error("Error procesando video:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
export const maxDuration = 60
