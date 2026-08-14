import { NextResponse } from "next/server"

// Nominatim permite máximo 1 request por segundo. Guardamos el timestamp
// de la última llamada en memoria del servidor para espaciarlas.
let ultimaLlamada = 0
const INTERVALO_MINIMO_MS = 1100 // un poco más de 1seg de margen

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(req: Request) {
  try {
    const { direccion } = await req.json()

    if (!direccion || typeof direccion !== "string" || direccion.trim().length < 3) {
      return NextResponse.json({ error: "Dirección inválida" }, { status: 400 })
    }

    // Rate limiting: si la última llamada fue hace poco, esperamos el resto
    const ahora = Date.now()
    const tiempoDesdeUltima = ahora - ultimaLlamada
    if (tiempoDesdeUltima < INTERVALO_MINIMO_MS) {
      await esperar(INTERVALO_MINIMO_MS - tiempoDesdeUltima)
    }
    ultimaLlamada = Date.now()

    const query = `${direccion.trim()}, Argentina`

    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      {
        headers: {
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