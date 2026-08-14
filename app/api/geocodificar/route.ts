import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { direccion } = await req.json()

    if (!direccion || typeof direccion !== "string" || direccion.trim().length < 3) {
      return NextResponse.json({ error: "Dirección inválida" }, { status: 400 })
    }

    const query = `${direccion.trim()}, Argentina`

    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      {
        headers: {
          // Requisito de la política de uso de Nominatim: identificar la app que consulta
          "User-Agent": "ViviendaYa/1.0 (contacto: viviendayatresa@gmail.com)",
        },
      }
    )

    if (!geoRes.ok) {
      return NextResponse.json({ error: "Error al geocodificar" }, { status: 502 })
    }

    const data = await geoRes.json()

    if (!data || !data[0]) {
      return NextResponse.json({ lat: null, lng: null })
    }

    return NextResponse.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}