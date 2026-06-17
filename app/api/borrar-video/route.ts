import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { guid } = await req.json()
    if (!guid) return NextResponse.json({ error: "No se recibió el guid del video" }, { status: 400 })

    const libraryId = process.env.BUNNY_LIBRARY_ID
    const apiKey = process.env.BUNNY_API_KEY

    if (!libraryId || !apiKey) {
      return NextResponse.json({ error: "Configuración de Bunny incompleta" }, { status: 500 })
    }

    const deleteRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${guid}`, {
      method: "DELETE",
      headers: { "AccessKey": apiKey }
    })

    if (!deleteRes.ok) {
      return NextResponse.json({ error: "Error al borrar el video de Bunny" }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}