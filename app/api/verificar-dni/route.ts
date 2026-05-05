import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ✅ Detecta el mime type real desde el header base64
function getMimeType(base64: string): string {
  const match = base64.match(/^data:(image\/\w+);base64,/)
  return match ? match[1] : "image/jpeg"
}

function stripBase64Header(base64: string): string {
  return base64.replace(/^data:image\/\w+;base64,/, "")
}

export async function POST(req: NextRequest) {
  try {
    const { dniFront, dniBack, userId } = await req.json()

    if (!dniFront || !dniBack) {
      return NextResponse.json({ error: "Faltan imagenes del DNI" }, { status: 400 })
    }

    const frontMime = getMimeType(dniFront)
    const backMime = getMimeType(dniBack)
    const frontBase64 = stripBase64Header(dniFront)
    const backBase64 = stripBase64Header(dniBack)

    console.log("[verificar-dni] mime types:", { frontMime, backMime })

    const prompt = `Sos un sistema de verificacion de identidad para una app inmobiliaria argentina.
Analiza estas dos imagenes de un DNI argentino (frente y dorso).

Verificá:
1. Si es un DNI argentino real y valido (no una fotocopia borrosa, no una pantalla fotografiada, no un DNI extranjero)
2. Si el frente muestra claramente: nombre, apellido, numero de DNI, fecha de nacimiento
3. Si el dorso es consistente con el frente

Respondé SOLO con un JSON sin markdown:
{"valido": true, "nombre": "Juan", "apellido": "Perez", "dni": "12345678", "fecha_nacimiento": "1990-05-15", "motivo": "DNI valido"}
o
{"valido": false, "nombre": null, "apellido": null, "dni": null, "fecha_nacimiento": null, "motivo": "Motivo del rechazo"}

Rechaza si: imagen borrosa, DNI de otro pais, fotocopia, pantalla fotografiada, datos ilegibles.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: frontMime, data: frontBase64 } },
              { inline_data: { mime_type: backMime, data: backBase64 } },
            ]
          }]
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error("[verificar-dni] Gemini error:", response.status, errText)
      return NextResponse.json({ error: "Error al contactar Gemini", detail: errText }, { status: 500 })
    }

    const aiData = await response.json()
    console.log("[verificar-dni] Gemini raw response:", JSON.stringify(aiData).slice(0, 300))

    const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{"valido":false,"motivo":"Sin respuesta de Gemini"}'
    console.log("[verificar-dni] Texto recibido:", text)

    let result
    try {
      result = JSON.parse(text.replace(/```json|```/g, "").trim())
    } catch {
      console.error("[verificar-dni] Error parseando JSON:", text)
      result = { valido: false, motivo: "Error al procesar respuesta de IA" }
    }

    // ✅ Actualizar usuario si es válido y hay userId
    if (result.valido && userId) {
      await supabase.from("users").update({
        dni_verificado: true,
        full_name: `${result.nombre} ${result.apellido}`.trim(),
      }).eq("id", userId)
    }

    return NextResponse.json({ ok: true, result })

  } catch (err: any) {
    console.error("[verificar-dni] Excepción:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}