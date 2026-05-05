import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
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