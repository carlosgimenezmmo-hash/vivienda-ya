"use client"

import { useState } from "react"
import {
  Home, Building, Warehouse, TreePine, Mountain, MapPin,
  Landmark, Store, Factory, Tractor,
  ChevronLeft, ChevronRight, Search, Check, Plus, Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchFilters, OperationType, PropertyType, PropertyCondition } from "@/lib/types"
import {
  provinces,
  citiesByProvince,
  neighborhoodsByCity,
  featureOptions,
  mockProperties,
} from "@/lib/mock-data"

const TOTAL_STEPS = 7

const operationOptions: { value: OperationType; label: string; icon: typeof Home }[] = [
  { value: "venta", label: "Comprar", icon: Home },
  { value: "alquiler", label: "Alquilar", icon: Building },
  { value: "permuta", label: "Permuta", icon: Warehouse },
  { value: "temporario", label: "Temporario", icon: TreePine },
]

const propertyTypes: { value: PropertyType; label: string; icon: typeof Home }[] = [
  { value: "casa", label: "Casa", icon: Home },
  { value: "departamento", label: "Depto", icon: Building },
  { value: "ph", label: "PH", icon: Landmark },
  { value: "cabana", label: "Cabana", icon: TreePine },
  { value: "quinta", label: "Quinta", icon: Mountain },
  { value: "terreno", label: "Terreno", icon: MapPin },
  { value: "local", label: "Local", icon: Store },
  { value: "oficina", label: "Oficina", icon: Warehouse },
  { value: "galpon", label: "Galpon", icon: Factory },
  { value: "campo", label: "Campo", icon: Tractor },
]

const priceRanges = [
  { label: "Hasta USD 50.000", min: 0, max: 50000 },
  { label: "USD 50.000 - 100.000", min: 50000, max: 100000 },
  { label: "USD 100.000 - 200.000", min: 100000, max: 200000 },
  { label: "USD 200.000 - 500.000", min: 200000, max: 500000 },
  { label: "Mas de USD 500.000", min: 500000, max: 999999999 },
]

const conditionOptions: { value: PropertyCondition; label: string }[] = [
  { value: "a-estrenar", label: "A estrenar" },
  { value: "muy-bueno", label: "Muy bueno" },
  { value: "bueno", label: "Bueno" },
  { value: "a-reciclar", label: "A reciclar" },
]

const featureLabels: Record<string, string> = {
  garage: "Garage", patio: "Patio", pileta: "Pileta", parrilla: "Parrilla",
  balcon: "Balcon", terraza: "Terraza", luminoso: "Luminoso", seguridad: "Seguridad",
  amenities: "Amenities", gym: "Gym", cochera: "Cochera", "vista-mar": "Vista al mar",
  "vista-lago": "Vista al lago", "vista-rio": "Vista al rio", quincho: "Quincho",
  jardin: "Jardin", "doble-altura": "Doble altura", "cocina-integrada": "Cocina integrada",
  chimenea: "Chimenea", deck: "Deck",
}

interface SearchWizardProps {
  onComplete: (filters: SearchFilters, count: number) => void
}

export function SearchWizard({ onComplete }: SearchWizardProps) {
  const [step, setStep] = useState(1)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showResults, setShowResults] = useState(false)

  const getResultCount = () => {
    return mockProperties.filter((p) => {
      if (filters.operation && p.operation !== filters.operation) return false
      if (filters.type && p.type !== filters.type) return false
      if (filters.province && p.location.province !== filters.province) return false
      if (filters.priceMin && p.price < filters.priceMin) return false
      if (filters.priceMax && p.price > filters.priceMax) return false
      if (filters.condition && p.condition !== filters.condition) return false
      return true
    }).length
  }

  const next = () => {
    if (step < TOTAL_STEPS) setStep(step + 1)
    else {
      setShowResults(true)
      onComplete(filters, getResultCount())
    }
  }
  const prev = () => { if (step > 1) setStep(step - 1) }

  // Counter component
  const Counter = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors active:bg-primary active:text-primary-foreground"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-lg font-bold text-foreground">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors active:bg-primary active:text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  if (showResults) {
    const count = getResultCount()
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-vy-green/10">
          <Search className="h-12 w-12 text-vy-green" />
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{count}</p>
          <p className="mt-1 text-muted-foreground">
            {count === 1 ? "propiedad encontrada" : "propiedades encontradas"}
          </p>
        </div>
        <button
          onClick={() => { setShowResults(false); setStep(1); setFilters({}) }}
          className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground"
        >
          Ver en el feed
        </button>
        <button
          onClick={() => { setShowResults(false); setStep(1); setFilters({}) }}
          className="text-sm text-muted-foreground"
        >
          Nueva busqueda
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i < step ? "bg-primary" : "bg-secondary"
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Paso {step} de {TOTAL_STEPS}
        </p>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 className="mb-1 text-xl font-bold text-foreground text-balance">Que estas buscando?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Selecciona el tipo de operacion</p>
            <div className="grid grid-cols-2 gap-3">
              {operationOptions.map((op) => {
                const Icon = op.icon
                const isSelected = filters.operation === op.value
                return (
                  <button
                    key={op.value}
                    onClick={() => { setFilters({ ...filters, operation: op.value }); next() }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all active:scale-95",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    )}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="text-sm font-semibold">{op.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="mb-1 text-xl font-bold text-foreground text-balance">Que tipo de propiedad?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Podes elegir una o varias</p>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypes.map((pt) => {
                const Icon = pt.icon
                const isSelected = filters.type === pt.value
                return (
                  <button
                    key={pt.value}
                    onClick={() => setFilters({ ...filters, type: pt.value })}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all active:scale-95",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{pt.label}</span>
                    {isSelected && <Check className="ml-auto h-4 w-4" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up">
            <h2 className="mb-1 text-xl font-bold text-foreground text-balance">Donde buscas?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Selecciona la ubicacion</p>
            <div className="flex flex-col gap-4">
              {/* Province */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Provincia</label>
                <div className="grid grid-cols-2 gap-2">
                  {provinces.map((prov) => (
                    <button
                      key={prov}
                      onClick={() => setFilters({ ...filters, province: prov, city: undefined, neighborhood: undefined })}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm transition-all active:scale-95",
                        filters.province === prov
                          ? "border-primary bg-primary/5 font-semibold text-primary"
                          : "border-border bg-card text-foreground"
                      )}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              {filters.province && citiesByProvince[filters.province] && (
                <div className="animate-slide-up">
                  <label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ciudad</label>
                  <div className="grid grid-cols-2 gap-2">
                    {citiesByProvince[filters.province]?.map((city) => (
                      <button
                        key={city}
                        onClick={() => setFilters({ ...filters, city, neighborhood: undefined })}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-sm transition-all active:scale-95",
                          filters.city === city
                            ? "border-primary bg-primary/5 font-semibold text-primary"
                            : "border-border bg-card text-foreground"
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Neighborhood */}
              {filters.city && neighborhoodsByCity[filters.city] && (
                <div className="animate-slide-up">
                  <label className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Barrio</label>
                  <div className="grid grid-cols-2 gap-2">
                    {neighborhoodsByCity[filters.city]?.map((nb) => (
                      <button
                        key={nb}
                        onClick={() => setFilters({ ...filters, neighborhood: nb })}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-sm transition-all active:scale-95",
                          filters.neighborhood === nb
                            ? "border-primary bg-primary/5 font-semibold text-primary"
                            : "border-border bg-card text-foreground"
                        )}
                      >
                        {nb}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-slide-up">
            <h2 className="mb-1 text-xl font-bold text-foreground text-balance">Cual es tu presupuesto?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Selecciona un rango rapido</p>
            <div className="flex flex-col gap-3">
              {priceRanges.map((range) => {
                const isSelected = filters.priceMin === range.min && filters.priceMax === range.max
                return (
                  <button
                    key={range.label}
                    onClick={() => setFilters({ ...filters, priceMin: range.min, priceMax: range.max })}
                    className={cn(
                      "rounded-xl border-2 px-4 py-4 text-left text-sm font-medium transition-all active:scale-95",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    {range.label}
                    {isSelected && <Check className="float-right mt-0.5 h-4 w-4" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-slide-up">
            <h2 className="mb-1 text-xl font-bold text-foreground text-balance">Que tamano necesitas?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Usa + y - para seleccionar</p>
            <div className="flex flex-col gap-4">
              <Counter label="Ambientes" value={filters.rooms || 0} onChange={(v) => setFilters({ ...filters, rooms: v })} />
              <Counter label="Dormitorios" value={filters.bedrooms || 0} onChange={(v) => setFilters({ ...filters, bedrooms: v })} />
              <Counter label="Banos" value={filters.bathrooms || 0} onChange={(v) => setFilters({ ...filters, bathrooms: v })} />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="animate-slide-up">
            <h2 className="mb-1 text-xl font-bold text-foreground text-balance">Que extras te interesan?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Selecciona todos los que quieras</p>
            <div className="grid grid-cols-2 gap-2">
              {featureOptions.map((feat) => {
                const isSelected = filters.features?.includes(feat)
                return (
                  <button
                    key={feat}
                    onClick={() => {
                      const current = filters.features || []
                      const next = isSelected
                        ? current.filter((f) => f !== feat)
                        : [...current, feat]
                      setFilters({ ...filters, features: next })
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm transition-all active:scale-95",
                      isSelected
                        ? "border-primary bg-primary/5 font-semibold text-primary"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    {featureLabels[feat] || feat}
                    {isSelected && <Check className="ml-1 inline h-3.5 w-3.5" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="animate-slide-up">
            <h2 className="mb-1 text-xl font-bold text-foreground text-balance">En que estado?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Estado general de la propiedad</p>
            <div className="flex flex-col gap-3">
              {conditionOptions.map((cond) => {
                const isSelected = filters.condition === cond.value
                return (
                  <button
                    key={cond.value}
                    onClick={() => setFilters({ ...filters, condition: cond.value })}
                    className={cn(
                      "rounded-xl border-2 px-4 py-4 text-left text-sm font-medium transition-all active:scale-95",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    {cond.label}
                    {isSelected && <Check className="float-right mt-0.5 h-4 w-4" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3 border-t border-border bg-card px-4 py-4 pb-20">
        {step > 1 && (
          <button
            onClick={prev}
            className="flex h-12 items-center gap-1 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors active:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
            Atras
          </button>
        )}
        <button
          onClick={next}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98]"
        >
          {step === TOTAL_STEPS ? (
            <>
              <Search className="h-4 w-4" />
              Buscar ({getResultCount()})
            </>
          ) : (
            <>
              {step === 1 ? "Selecciona para continuar" : "Siguiente"}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
