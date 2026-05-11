"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

const TOTAL_STEPS = 3

const operationOptions = [
  { value: "venta", label: "Comprar" },
  { value: "alquiler", label: "Alquilar" },
  { value: "permuta", label: "Permuta" },
  { value: "temporario", label: "Temporario" },
]

const propertyTypes = [
  { value: "departamento", label: "Depto" },
  { value: "casa", label: "Casa" },
  { value: "ph", label: "PH" },
  { value: "loft", label: "Loft" },
  { value: "monoambiente", label: "Mono" },
  { value: "cabana", label: "Cabaña" },
  { value: "quinta", label: "Quinta" },
  { value: "terreno", label: "Terreno" },
  { value: "local", label: "Local" },
  { value: "oficina", label: "Oficina" },
  { value: "galpon", label: "Galpón" },
  { value: "campo", label: "Campo" },
]

const priceRangesVenta = [
  { label: "Hasta USD 50.000", min: 0, max: 50000 },
  { label: "USD 50.000 - 100.000", min: 50000, max: 100000 },
  { label: "USD 100.000 - 200.000", min: 100000, max: 200000 },
  { label: "USD 200.000 - 500.000", min: 200000, max: 500000 },
  { label: "Mas de USD 500.000", min: 500000, max: 999999999 },
]

const priceRangesAlquiler = [
  { label: "Hasta USD 300/mes", min: 0, max: 300 },
  { label: "USD 300 - 600/mes", min: 300, max: 600 },
  { label: "USD 600 - 1.000/mes", min: 600, max: 1000 },
  { label: "USD 1.000 - 2.000/mes", min: 1000, max: 2000 },
]

const priceRangesTemporario = [
  { label: "Hasta ARS 50.000/noche", min: 0, max: 50000 },
  { label: "ARS 50.000 - 100.000/noche", min: 50000, max: 100000 },
  { label: "ARS 100.000 - 200.000/noche", min: 100000, max: 200000 },
  { label: "ARS 200.000 - 500.000/noche", min: 200000, max: 500000 },
  { label: "Mas de ARS 500.000/noche", min: 500000, max: 999999999 },
]

const provinces = ["Buenos Aires", "CABA", "Cordoba", "Santa Fe", "Mendoza", "Tucuman", "Salta", "Misiones", "Entre Rios", "Chubut", "Rio Negro", "Neuquen", "San Juan", "San Luis", "La Rioja", "Catamarca", "Jujuy", "Formosa", "Chaco", "Santiago del Estero", "La Pampa", "Santa Cruz", "Tierra del Fuego", "Corrientes"]

const citiesByProvince: Record<string, string[]> = {
  "Buenos Aires": ["La Plata", "Mar del Plata", "Bahia Blanca", "Quilmes", "Lomas de Zamora", "San Isidro", "Vicente Lopez", "Tigre", "Pilar", "Campana", "Zarate", "Tandil", "Necochea", "Tres Arroyos", "Azul", "Olavarria", "Pergamino", "San Nicolas", "Junin", "Mercedes", "Lujan", "Moron", "Merlo", "Moreno", "San Martin", "Avellaneda", "Lanus", "Almirante Brown"],
  "CABA": ["Palermo", "Belgrano", "Recoleta", "San Telmo", "Puerto Madero", "Caballito", "Villa Crespo", "Almagro", "Balvanera", "Flores", "Floresta", "Villa del Parque", "Devoto", "Colegiales", "Nunez", "Saavedra", "Barracas", "La Boca", "Mataderos", "Liniers"],
  "Cordoba": ["Cordoba Capital", "Villa Carlos Paz", "Rio Cuarto", "Villa Maria", "San Francisco", "Alta Gracia", "La Falda", "Cosquin", "Villa General Belgrano", "Cruz del Eje", "Dean Funes", "Rio Tercero"],
  "Santa Fe": ["Rosario", "Santa Fe Capital", "Rafaela", "Venado Tuerto", "Reconquista", "Sunchales", "Esperanza", "Santo Tome", "Coronda", "Casilda"],
  "Mendoza": ["Mendoza Capital", "San Rafael", "Godoy Cruz", "Lujan de Cuyo", "Maipu", "Las Heras", "Guaymallen", "Tunuyan", "Rivadavia", "La Paz"],
  "Tucuman": ["San Miguel de Tucuman", "Yerba Buena", "Tafi Viejo", "Concepcion", "Banda del Rio Sali", "Famailla"],
  "Salta": ["Salta Capital", "San Ramon de la Nueva Oran", "Tartagal", "Cafayate", "Rosario de la Frontera"],
  "Neuquen": ["Neuquen Capital", "San Martin de los Andes", "Villa La Angostura", "Zapala", "Cutral Co"],
  "Rio Negro": ["Bariloche", "Viedma", "General Roca", "Cipolletti", "El Bolson", "Villa Regina"],
  "Misiones": ["Posadas", "Obera", "Eldorado", "Puerto Iguazu", "Apostoles"],
  "Entre Rios": ["Parana", "Concordia", "Gualeguaychu", "Colon", "Federacion"],
  "Chubut": ["Comodoro Rivadavia", "Rawson", "Trelew", "Puerto Madryn", "Esquel"],
  "San Juan": ["San Juan Capital", "Caucete", "Rivadavia", "Chimbas", "Rawson"],
  "San Luis": ["San Luis Capital", "Villa Mercedes", "Merlo", "Potrero de los Funes"],
  "Jujuy": ["San Salvador de Jujuy", "Palpala", "Libertador General San Martin", "Humahuaca"],
  "Corrientes": ["Corrientes Capital", "Goya", "Paso de los Libres", "Mercedes", "Curuzu Cuatia"],
  "Chaco": ["Resistencia", "Presidencia Roque Saenz Pena", "Villa Angela", "Charata"],
  "Formosa": ["Formosa Capital", "Clorinda", "Pirane", "El Colorado"],
  "La Pampa": ["Santa Rosa", "General Pico", "Toay", "Eduardo Castex"],
  "Santa Cruz": ["Rio Gallegos", "Caleta Olivia", "El Calafate", "Puerto Madryn"],
  "La Rioja": ["La Rioja Capital", "Chilecito", "Aimogasta"],
  "Catamarca": ["Catamarca Capital", "San Fernando del Valle", "Belen"],
  "Santiago del Estero": ["Santiago del Estero Capital", "La Banda", "Termas de Rio Hondo"],
  "Tierra del Fuego": ["Ushuaia", "Rio Grande", "Tolhuin"],
}

const featureOptions = ["Garage", "Patio", "Pileta", "Parrilla", "Balcon", "Terraza", "Luminoso", "Seguridad", "Amenities", "Gym", "Cochera", "Quincho", "Jardin", "Chimenea", "Deck"]

const conditionOptions = [
  { value: "a-estrenar", label: "A estrenar" },
  { value: "muy-bueno", label: "Muy bueno" },
  { value: "bueno", label: "Bueno" },
  { value: "a-reciclar", label: "A reciclar" },
]

export function SearchWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [filters, setFilters] = useState<any>({})
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [mostrarMasFiltros, setMostrarMasFiltros] = useState(false)

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "10px 16px", borderRadius: 12,
    border: `2px solid ${active ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
    background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
    color: active ? "#60A5FA" : "rgba(255,255,255,0.7)",
    fontSize: 14, fontWeight: active ? 700 : 500, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex", alignItems: "center", gap: 8,
  })

  const btn: React.CSSProperties = {
    padding: "14px 20px", borderRadius: 14, border: "none",
    background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 10px",
    fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
  }

  const handleSearch = async () => {
    setLoading(true)
    let query = supabase.from("properties").select("*").eq("status", "approved").not("video_url", "is", null)
    if (filters.operation) query = query.ilike("operation_type", filters.operation)
    if (filters.propertyType) query = query.ilike("property_type", `%${filters.propertyType}%`)
    if (filters.province) query = query.ilike("province", `%${filters.province}%`)
    if (filters.city) query = query.ilike("city", `%${filters.city}%`)
    if (filters.priceMin !== undefined) query = query.gte("price", filters.priceMin)
    if (filters.priceMax !== undefined && filters.priceMax < 999999999) query = query.lte("price", filters.priceMax)
    if (filters.rooms) query = query.gte("rooms", filters.rooms)
    if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms)
    const { data } = await query.order("created_at", { ascending: false }).limit(50)
    setResults(data || [])
    setShowResults(true)
    setLoading(false)
  }

  const next = () => { if (step < TOTAL_STEPS) setStep(step + 1); else handleSearch() }
  const prev = () => { if (step > 1) setStep(step - 1) }

  if (showResults) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", paddingBottom: 100, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => { setShowResults(false); setStep(1); setFilters({}) }} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{results.length} {results.length === 1 ? "propiedad" : "propiedades"}</h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{filters.operation || "Todas"}{filters.city ? ` en ${filters.city}` : filters.province ? ` en ${filters.province}` : ""}</p>
          </div>
        </div>
        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 40, margin: "0 0 16px" }}>🔍</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Sin resultados</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Proba con otros filtros</p>
            <button onClick={() => { setShowResults(false); setStep(1); setFilters({}) }} style={{ ...btn, padding: "14px 28px" }}>Nueva busqueda</button>
          </div>
        ) : (
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {results.map((p) => (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", cursor: "pointer" }} onClick={() => router.push("/")}>
                {p.video_url && <video src={p.video_url} style={{ width: "100%", height: 200, objectFit: "cover" }} muted playsInline />}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{p.operation_type?.toUpperCase()}</span>
                    {p.verified && <span style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>GPS OK</span>}
                  </div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{p.title || "Sin titulo"}</h3>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{[p.neighborhood, p.city].filter(Boolean).join(", ") || p.location}</p>
                  <p style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>USD {Number(p.price)?.toLocaleString()}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{[p.rooms ? `${p.rooms} amb.` : null, p.surface ? `${p.surface} m2` : null, p.bedrooms ? `${p.bedrooms} dorm.` : null].filter(Boolean).join(" - ")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 16px", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Buscar</h1>
          <span style={{ background: "rgba(37,99,235,0.2)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
            Paso {step}/{TOTAL_STEPS}
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? "#2563EB" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>

      {/* CONTENIDO CON SCROLL */}
      <div style={{ padding: "8px 20px 200px", overflowY: "auto" }}>

        {/* PASO 1 — OPERACION + TIPO */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Que estas buscando?</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>Selecciona el tipo de operacion y propiedad</p>

            <p style={sectionLabel}>Operacion</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {operationOptions.map((op) => (
                <button key={op.value} onClick={() => setFilters({ ...filters, operation: op.value })}
                  style={{ ...chip(filters.operation === op.value), justifyContent: "center", padding: "16px", fontSize: 15, fontWeight: 700 }}>
                  {op.label}
                </button>
              ))}
            </div>

            <p style={sectionLabel}>Tipo de propiedad</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {propertyTypes.map((pt) => (
                <button key={pt.value} onClick={() => setFilters({ ...filters, propertyType: pt.value })}
                  style={{ ...chip(filters.propertyType === pt.value), justifyContent: "flex-start" }}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2 — UBICACION + PRECIO */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Donde y cuanto?</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>Ubicacion y presupuesto</p>

            <p style={sectionLabel}>Provincia</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {provinces.map((prov) => (
                <button key={prov} onClick={() => setFilters({ ...filters, province: prov, city: undefined })}
                  style={chip(filters.province === prov)}>
                  {prov}
                </button>
              ))}
            </div>

            {filters.province && citiesByProvince[filters.province] && (
              <div style={{ marginBottom: 16 }}>
                <p style={sectionLabel}>Ciudad</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {citiesByProvince[filters.province].map((city) => (
                    <button key={city} onClick={() => setFilters({ ...filters, city })}
                      style={chip(filters.city === city)}>
                      {city}
                    </button>
                  ))}
                </div>
                <input
                  placeholder="O escribi cualquier ciudad..."
                  value={filters.city && !citiesByProvince[filters.province]?.includes(filters.city) ? filters.city : ""}
                  onChange={e => setFilters({ ...filters, city: e.target.value })}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
                />
              </div>
            )}

            <p style={{ ...sectionLabel, marginTop: 24 }}>Presupuesto</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(filters.operation === "alquiler" ? priceRangesAlquiler : filters.operation === "temporario" ? priceRangesTemporario : priceRangesVenta).map((range) => {
                const active = filters.priceMin === range.min && filters.priceMax === range.max
                return (
                  <button key={range.label} onClick={() => setFilters({ ...filters, priceMin: range.min, priceMax: range.max })}
                    style={{ ...chip(active), justifyContent: "space-between", padding: "14px 18px" }}>
                    <span>{range.label}</span>
                    {active && <span style={{ fontSize: 12 }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* PASO 3 — FILTROS ADICIONALES */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Algo mas?</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>Filtros opcionales — podes saltear este paso</p>

            <p style={sectionLabel}>Ambientes minimos</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {[0, 1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setFilters({ ...filters, rooms: n })}
                  style={{ ...chip(filters.rooms === n), padding: "10px 18px", fontSize: 15, fontWeight: 700 }}>
                  {n === 0 ? "Cualquiera" : `${n}+`}
                </button>
              ))}
            </div>

            <p style={sectionLabel}>Dormitorios minimos</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {[0, 1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setFilters({ ...filters, bedrooms: n })}
                  style={{ ...chip(filters.bedrooms === n), padding: "10px 18px", fontSize: 15, fontWeight: 700 }}>
                  {n === 0 ? "Cualquiera" : `${n}+`}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMostrarMasFiltros(!mostrarMasFiltros)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 18px", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginBottom: 20, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
              {mostrarMasFiltros ? "▲ Menos filtros" : "▼ Mas filtros (extras y estado)"}
            </button>

            {mostrarMasFiltros && (
              <div>
                <p style={sectionLabel}>Extras</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
                  {featureOptions.map((feat) => {
                    const active = (filters.features || []).includes(feat)
                    return (
                      <button key={feat} onClick={() => {
                        const current = filters.features || []
                        setFilters({ ...filters, features: active ? current.filter((f: string) => f !== feat) : [...current, feat] })
                      }} style={chip(active)}>
                        {feat}
                      </button>
                    )
                  })}
                </div>

                <p style={sectionLabel}>Estado</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {conditionOptions.map((cond) => (
                    <button key={cond.value} onClick={() => setFilters({ ...filters, condition: cond.value })}
                      style={{ ...chip(filters.condition === cond.value), justifyContent: "space-between", padding: "14px 18px" }}>
                      <span style={{ fontSize: 15 }}>{cond.label}</span>
                      {filters.condition === cond.value && <span style={{ fontSize: 12 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* BOTONES FIJOS */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px 90px", background: "rgba(10,10,10,0.97)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10, zIndex: 20 }}>
        {step > 1 && (
          <button onClick={prev} style={{ padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
            Atras
          </button>
        )}
        <button onClick={next} disabled={loading} style={{ ...btn, flex: 1, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Buscando..." : step === TOTAL_STEPS ? "Buscar" : "Siguiente"}
        </button>
      </div>
    </div>
  )
}