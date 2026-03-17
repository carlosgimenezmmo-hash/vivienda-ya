"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

const TOTAL_STEPS = 7

const operationOptions = [
  { value: "venta", label: "Comprar", emoji: "ðŸ " },
  { value: "alquiler", label: "Alquilar", emoji: "ðŸ”‘" },
  { value: "permuta", label: "Permuta", emoji: "ðŸ”„" },
  { value: "temporario", label: "Temporario", emoji: "ðŸ“…" },
]

const propertyTypes = [
  { value: "departamento", label: "Depto", emoji: "ðŸ¢" },
  { value: "casa", label: "Casa", emoji: "ðŸ¡" },
  { value: "ph", label: "PH", emoji: "ðŸ›ï¸" },
  { value: "loft", label: "Loft", emoji: "ðŸ™ï¸" },
  { value: "monoambiente", label: "Mono", emoji: "ðŸ›ï¸" },
  { value: "cabana", label: "CabaÃ±a", emoji: "ðŸŒ²" },
  { value: "quinta", label: "Quinta", emoji: "ðŸŒ¿" },
  { value: "terreno", label: "Terreno", emoji: "ðŸ“" },
  { value: "local", label: "Local", emoji: "ðŸª" },
  { value: "oficina", label: "Oficina", emoji: "ðŸ’¼" },
  { value: "galpon", label: "GalpÃ³n", emoji: "ðŸ­" },
  { value: "campo", label: "Campo", emoji: "ðŸšœ" },
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
  { label: "Mas de USD 2.000/mes", min: 2000, max: 999999 },
]

const provinces = ["Buenos Aires", "CABA", "Cordoba", "Santa Fe", "Mendoza", "Tucuman", "Rio Negro", "Neuquen", "Salta", "Misiones", "Entre Rios", "Chubut"]

const featureOptions = [
  "Garage", "Patio", "Pileta", "Parrilla", "Balcon", "Terraza",
  "Luminoso", "Seguridad", "Amenities", "Gym", "Cochera",
  "Vista al mar", "Quincho", "Jardin", "Chimenea", "Deck"
]

const conditionOptions = [
  { value: "a-estrenar", label: "A estrenar", emoji: "âœ¨" },
  { value: "muy-bueno", label: "Muy bueno", emoji: "â­" },
  { value: "bueno", label: "Bueno", emoji: "ðŸ‘" },
  { value: "a-reciclar", label: "A reciclar", emoji: "ðŸ”¨" },
]

export function SearchWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [filters, setFilters] = useState<any>({})
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState("")

  const chip = (active: boolean) => ({
    padding: "10px 16px",
    borderRadius: 12,
    border: `2px solid ${active ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
    background: active ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
    color: active ? "#60A5FA" : "rgba(255,255,255,0.7)",
    fontSize: 14, fontWeight: active ? 700 : 500,
    cursor: "pointer", transition: "all 0.15s",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex", alignItems: "center", gap: 8,
  } as React.CSSProperties)

  const btn = {
    padding: "14px 20px", borderRadius: 14, border: "none",
    background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  } as React.CSSProperties

  const handleSearch = async () => {
    setLoading(true)
    let query = supabase.from("properties").select("*").eq("status", "approved").not("video_url", "is", null)
    if (filters.operation) query = query.ilike("operation_type", filters.operation)
    if (filters.propertyType) query = query.ilike("property_type", filters.propertyType)
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

  const next = () => { if (step < TOTAL_STEPS) { setStep(step + 1) } else { handleSearch() } }
  const prev = () => { if (step > 1) setStep(step - 1) }

  const title = { fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px" } as React.CSSProperties
  const subtitle = { fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" } as React.CSSProperties

  if (showResults) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", paddingBottom: 100, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => { setShowResults(false); setStep(1); setFilters({}) }}
            style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
              {results.length} {results.length === 1 ? "propiedad" : "propiedades"}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              {filters.operation ? filters.operation.charAt(0).toUpperCase() + filters.operation.slice(1) : "Todas"}
              {filters.city ? ` Â· ${filters.city}` : filters.province ? ` Â· ${filters.province}` : ""}
            </p>
          </div>
        </div>

        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <span style={{ fontSize: 48 }}>ðŸ”</span>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "16px 0 8px" }}>Sin resultados</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px" }}>Proba con otros filtros</p>
            <button onClick={() => { setShowResults(false); setStep(1); setFilters({}) }} style={{ ...btn, width: "auto", padding: "14px 28px" }}>
              Nueva busqueda
            </button>
          </div>
        ) : (
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {results.map((p) => (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}
                onClick={() => router.push("/")}>
                {p.video_url && (
                  <video src={p.video_url} style={{ width: "100%", height: 200, objectFit: "cover" }} muted playsInline />
                )}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                      {p.operation_type?.toUpperCase()}
                    </span>
                    {p.verified && (
                      <span style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                        GPS âœ“
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{p.title || "Sin titulo"}</h3>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    ðŸ“ {[p.neighborhood, p.city].filter(Boolean).join(", ") || p.location}
                  </p>
                  <p style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>
                    USD {Number(p.price)?.toLocaleString()}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    {[p.rooms ? `${p.rooms} amb.` : null, p.surface ? `${p.surface} mÂ²` : null, p.bedrooms ? `${p.bedrooms} dorm.` : null].filter(Boolean).join(" Â· ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Buscar</h1>
          <span style={{ background: "rgba(37,99,235,0.2)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
            Paso {step}/{TOTAL_STEPS}
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? "#2563EB" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: "24px 20px 120px", overflowY: "auto" }}>

        {step === 1 && (
          <div>
            <h2 style={title}>Que estas buscando?</h2>
            <p style={subtitle}>Selecciona el tipo de operacion</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {operationOptions.map((op) => (
                <button key={op.value} onClick={() => { setFilters({ ...filters, operation: op.value }); next() }}
                  style={{ ...chip(filters.operation === op.value), flexDirection: "column", padding: "20px 16px", gap: 10, justifyContent: "center" }}>
                  <span style={{ fontSize: 32 }}>{op.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{op.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={title}>Que tipo de propiedad?</h2>
            <p style={subtitle}>Podes elegir una o varias</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {propertyTypes.map((pt) => (
                <button key={pt.value} onClick={() => setFilters({ ...filters, propertyType: pt.value })}
                  style={{ ...chip(filters.propertyType === pt.value), justifyContent: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{pt.emoji}</span>
                  <span>{pt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={title}>Donde buscas?</h2>
            <p style={subtitle}>Selecciona la ubicacion</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Provincia</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {provinces.map((prov) => (
                <button key={prov} onClick={() => { setSelectedProvince(prov); setFilters({ ...filters, province: prov, city: undefined }) }}
                  style={chip(filters.province === prov)}>
                  {prov}
                </button>
              ))}
            </div>
            {selectedProvince && (
              <div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Ciudad (opcional)</p>
                <input
                  placeholder="Escribi la ciudad..."
                  value={filters.city || ""}
                  onChange={e => setFilters({ ...filters, city: e.target.value })}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
                />
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={title}>Cual es tu presupuesto?</h2>
            <p style={subtitle}>{filters.operation === "alquiler" ? "Precio mensual" : "Precio total"}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(filters.operation === "alquiler" ? priceRangesAlquiler : priceRangesVenta).map((range) => {
                const active = filters.priceMin === range.min && filters.priceMax === range.max
                return (
                  <button key={range.label} onClick={() => setFilters({ ...filters, priceMin: range.min, priceMax: range.max })}
                    style={{ ...chip(active), justifyContent: "space-between" }}>
                    <span>{range.label}</span>
                    {active && <span>âœ“</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={title}>Que tamano necesitas?</h2>
            <p style={subtitle}>Minimo de ambientes y dormitorios</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Ambientes", key: "rooms" },
                { label: "Dormitorios", key: "bedrooms" },
                { label: "Banos", key: "bathrooms" },
              ].map(({ label, key }) => (
                <div key={key} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setFilters({ ...filters, [key]: Math.max(0, (filters[key] || 0) - 1) })}
                      style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>âˆ’</button>
                    <span style={{ fontSize: 20, fontWeight: 800, minWidth: 24, textAlign: "center" }}>{filters[key] || 0}</span>
                    <button onClick={() => setFilters({ ...filters, [key]: (filters[key] || 0) + 1 })}
                      style={{ width: 36, height: 36, borderRadius: "50%", background: "#2563EB", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 style={title}>Que extras te interesan?</h2>
            <p style={subtitle}>Selecciona todos los que quieras</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {featureOptions.map((feat) => {
                const active = filters.features?.includes(feat)
                return (
                  <button key={feat} onClick={() => {
                    const current = filters.features || []
                    setFilters({ ...filters, features: active ? current.filter((f: string) => f !== feat) : [...current, feat] })
                  }} style={chip(active)}>
                    {feat} {active && "âœ“"}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h2 style={title}>En que estado?</h2>
            <p style={subtitle}>Estado general de la propiedad</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {conditionOptions.map((cond) => (
                <button key={cond.value} onClick={() => setFilters({ ...filters, condition: cond.value })}
                  style={{ ...chip(filters.condition === cond.value), justifyContent: "flex-start", padding: "16px 20px" }}>
                  <span style={{ fontSize: 24 }}>{cond.emoji}</span>
                  <span style={{ fontSize: 15 }}>{cond.label}</span>
                  {filters.condition === cond.value && <span style={{ marginLeft: "auto" }}>âœ“</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTONES */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px calc(16px + env(safe-area-inset-bottom))", background: "rgba(10,10,10,0.95)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10, zIndex: 20 }}>
        {step > 1 && (
          <button onClick={prev} style={{ padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            â† Atras
          </button>
        )}
        <button onClick={next} disabled={loading} style={{ ...btn, flex: 1, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Buscando..." : step === TOTAL_STEPS ? "ðŸ” Buscar" : "Siguiente â†’"}
        </button>
      </div>
    </div>
  )
}
