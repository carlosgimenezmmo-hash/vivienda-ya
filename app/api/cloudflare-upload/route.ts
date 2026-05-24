import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": file.type,
          "Tus-Resumable": "1.0.0",
          "Upload-Length": String(buffer.length),
          "Upload-Metadata": `name ${Buffer.from(file.name).toString("base64")}`,
        },
        body: buffer,
      }
    )

    const text = await response.text()

    let data
    try {
      data = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: "Cloudflare error: " + text.slice(0, 200) }, { status: 500 })
    }

    if (!data.success) {
      return NextResponse.json({ error: data.errors?.[0]?.message || "Error Cloudflare" }, { status: 500 })
    }

    const videoId = data.result.uid
    const videoUrl = `https://videodelivery.net/${videoId}/manifest/video.m3u8`
    const thumbnail = `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`

    return NextResponse.json({ videoUrl, thumbnail, videoId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}