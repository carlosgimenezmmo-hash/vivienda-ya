import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, modo } = await req.json()

    if (!videoUrl) return NextResponse.json({ error: "Video requerido" }, { status: 400 })

    // 1. SUBTITULOS con AssemblyAI
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

    // 2. Esperar resultado
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

    // 3. DESCRIPCION con Gemini
    let descripcionIA = ""
    if (modo === "completo" && subtitulos) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Sos un experto inmobiliario argentino. Basándote en esta transcripción de un video de propiedad, escribí una descripción profesional y atractiva de máximo 150 caracteres para publicar en un marketplace inmobiliario: "${subtitulos}"`
              }]
            }]
          })
        }
      )
      const geminiData = await geminiRes.json()
      descripcionIA = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    }

    return NextResponse.json({
      ok: true,
      subtitulos,
      descripcionIA,
      transcriptId,
    })

  } catch (err: any) {
    console.error("Error procesando video:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export const maxDuration = 60