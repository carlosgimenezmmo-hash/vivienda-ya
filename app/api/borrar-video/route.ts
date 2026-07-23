import { NextRequest, NextResponse } from "next/server"
import { parseBearerToken, requireEnv } from "@/lib/utils"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = parseBearerToken(authHeader)
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { guid, property_id } = await req.json()
    if (!guid || !property_id) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const { data: property, error: propertyError } = await supabaseAdmin
      .from("properties")
      .select("id, user_id, bunny_guid")
      .eq("id", property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 })
    }

    if (property.user_id !== user.id || property.bunny_guid !== guid) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const libraryId = requireEnv("BUNNY_LIBRARY_ID")
    const apiKey = requireEnv("BUNNY_API_KEY")

    if (!libraryId || !apiKey) {
      return NextResponse.json({ error: "Configuración de Bunny incompleta" }, { status: 500 })
    }

    const deleteRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${guid}`, {
      method: "DELETE",
      headers: { "AccessKey": apiKey },
    })

    if (!deleteRes.ok) {
      return NextResponse.json({ error: "Error al borrar el video de Bunny" }, { status: 500 })
    }

    await supabaseAdmin
      .from("properties")
      .update({ bunny_guid: null, video_url: null })
      .eq("id", property_id)

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}