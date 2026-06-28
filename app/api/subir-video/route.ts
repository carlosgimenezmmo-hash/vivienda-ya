import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
   const formData = await req.formData()
    const file = formData.get("video") as File
    const userId = formData.get("user_id") as string
    if (!file) return NextResponse.json({ error: "No se recibió video" }, { status: 400 })
    if (!userId) return NextResponse.json({ error: "Usuario no identificado" }, { status: 400 })

    const { createClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", unaHoraAtras)

    if (count !== null && count >= 10) {
      return NextResponse.json({ error: "Alcanzaste el límite de 10 publicaciones por hora. Esperá un poco antes de subir más." }, { status: 429 })
    }

    const libraryId = process.env.BUNNY_LIBRARY_ID
    const apiKey = process.env.BUNNY_API_KEY
    const hostname = process.env.BUNNY_CDN_HOSTNAME

    if (!libraryId || !apiKey || !hostname) {
      return NextResponse.json({ error: "Configuración de Bunny incompleta" }, { status: 500 })
    }

    // Crear video en Bunny
    const createRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
      method: "POST",
      headers: {
        "AccessKey": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: `video-${Date.now()}` })
    })

    if (!createRes.ok) return NextResponse.json({ error: "Error al crear video en Bunny" }, { status: 500 })

    const { guid } = await createRes.json()

    // Subir el video
    const buffer = await file.arrayBuffer()
    const uploadRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${guid}`, {
      method: "PUT",
      headers: {
        "AccessKey": apiKey,
        "Content-Type": "application/octet-stream"
      },
      body: buffer
    })

    if (!uploadRes.ok) return NextResponse.json({ error: "Error al subir video a Bunny" }, { status: 500 })

    const videoUrl = `https://${hostname}/${guid}/play_720p.mp4`

    return NextResponse.json({ videoUrl, guid })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}