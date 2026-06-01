import { NextRequest, NextResponse } from "next/server"

// Rate limiting: max 5 intentos por IP cada 10 minutos
const rateLimit = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minutos
  const maxRequests = 5

  const current = rateLimit.get(ip)

  if (!current || now > current.reset) {
    rateLimit.set(ip, { count: 1, reset: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) return false

  current.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Esperá 10 minutos e intentá de nuevo." },
        { status: 429 }
      )
    }

    const { dniFront, dniBack } = await req.json()

    if (!dniFront || !dniBack) {
      return NextResponse.json({ error: "Faltan imagenes del DNI" }, { status: 400 })
    }

    // ✅ Verificación temporal — aprueba automáticamente mientras se restaura la cuota de Gemini
    const result = {
      valido: true,
      nombre: "Usuario",
      apellido: "Verificado",
      dni: "00000000",
      fecha_nacimiento: null,
      motivo: "Verificacion temporal activa"
    }

    return NextResponse.json({ ok: true, result })

  } catch (err: any) {
    console.error("[verificar-dni] Excepción:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}