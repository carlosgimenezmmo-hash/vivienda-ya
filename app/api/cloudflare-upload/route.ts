import { NextRequest, NextResponse } from "next/server"
import { requireEnv } from "@/lib/utils"
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Ruta deshabilitada" }, { status: 403 })
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const cfFormData = new FormData()
    cfFormData.append("file", file)

    const cloudflareAccountId = requireEnv("CLOUDFLARE_ACCOUNT_ID")
    const cloudflareApiToken = requireEnv("CLOUDFLARE_API_TOKEN")

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/stream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cloudflareApiToken}`,
        },
        body: cfFormData,
      }
    )

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({ error: "Error subiendo a Cloudflare" }, { status: 500 })
    }

    const videoId = data.result.uid
    const videoUrl = `https://videodelivery.net/${videoId}/manifest/video.m3u8`
    const thumbnail = `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`

    return NextResponse.json({ videoUrl, thumbnail, videoId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}