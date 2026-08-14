import { NextResponse } from "next/server"

// Calcula distancia en metros entre dos coordenadas (fórmula de Haversine)
function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const rad = (deg: number) => (deg * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Mapeo de categorías OSM a etiquetas y emojis en español
const CATEGORIAS: Record<string, { label: string; icono: string }> = {
  school: { label: "Escuela", icono: "🏫" },
  kindergarten: { label: "Jardín de infantes", icono: "🧸" },
  hospital: { label: "Hospital", icono: "🏥" },
  clinic: { label: "Clínica", icono: "🏥" },
  pharmacy: { label: "Farmacia", icono: "💊" },
  supermarket: { label: "Supermercado", icono: "🛒" },
  park: { label: "Plaza / Parque", icono: "🌳" },
  bank: { label: "Banco", icono: "🏦" },
  restaurant: { label: "Restaurante", icono: "🍽️" },
  bus_station: { label: "Parada de colectivo", icono: "🚌" },
  attraction: { label: "Centro turístico", icono: "📍" },
  beach: { label: "Playa", icono: "🏖️" },
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = parseFloat(searchParams.get("lat") || "")
    const lng = parseFloat(searchParams.get("lng") || "")
    const radio = parseInt(searchParams.get("radio") || "1000") // metros

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: "Faltan coordenadas válidas" }, { status: 400 })
    }

    const claves = Object.keys(CATEGORIAS)

    // Armamos la query de Overpass buscando amenity/leisure/tourism cerca del punto
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"~"${claves.join("|")}"](around:${radio},${lat},${lng});
        node["leisure"="park"](around:${radio},${lat},${lng});
        node["tourism"="attraction"](around:${radio},${lat},${lng});
        node["natural"="beach"](around:${radio},${lat},${lng});
      );
      out body;
    `

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
    })

    if (!response.ok) {
      throw new Error("Error al consultar Overpass API")
    }

    const data = await response.json()

    const puntos = (data.elements || [])
      .map((el: any) => {
        const tags = el.tags || {}
        const tipo = tags.amenity || tags.leisure || tags.tourism || tags.natural
        const categoria = CATEGORIAS[tipo] || { label: tipo, icono: "📍" }
        const distancia = Math.round(distanciaMetros(lat, lng, el.lat, el.lon))
        return {
          nombre: tags.name || categoria.label,
          categoria: categoria.label,
          icono: categoria.icono,
          distancia,
        }
      })
      .filter((p: any) => p.distancia <= radio)
      .sort((a: any, b: any) => a.distancia - b.distancia)
      .slice(0, 15) // limitamos para no saturar el detalle de la propiedad

    return NextResponse.json({ puntos })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}