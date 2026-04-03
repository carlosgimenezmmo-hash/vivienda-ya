import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, modo, transcriptId } = await req.json()

    if (!videoUrl && !transcriptId) return NextResponse.json({ error: "Video o transcriptId requerido" }, { status: 400 })

    // MODO INICIAR - solo lanza el proceso y devuelve el ID
    if (modo === "iniciar") {
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
      return NextResponse.json({ ok: true, transcriptId: transcript.id })
    }

    // MODO CONSULTAR - verifica si ya terminó
    if (modo === "consultar" && transcriptId) {
      const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { "Authorization": process.env.ASSEMBLYAI_API_KEY! },
      })
      const status = await statusRes.json()

      if (status.status === "completed") {
        const subtitulos = status.text || ""
        let descripcionIA = ""

        if (subtitulos) {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Sos un experto inmobiliario argentino. Basandote en esta transcripcion de un video de propiedad, escribi una descripcion profesional y atractiva de maximo 150 caracteres: "${subtitulos}"`
                  }]
                }]
              })
            }
          )
          const geminiData = await geminiRes.json()
          descripcionIA = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ""
        }

        return NextResponse.json({ ok: true, listo: true, subtitulos, descripcionIA })
      }

      if (status.status === "error") {
        return NextResponse.json({ ok: true, listo: false, error: "Error en transcripcion" })
      }

      return NextResponse.json({ ok: true, listo: false, status: status.status })
    }

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    console.error("Error procesando video:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export const maxDuration = 60
