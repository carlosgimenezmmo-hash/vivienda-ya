"use client"

import { useState } from "react"
import { SearchWizard } from "@/components/search-wizard"
import type { SearchFilters } from "@/lib/types"

export default function BuscarPage() {
  const [, setResults] = useState<{ filters: SearchFilters; count: number } | null>(null)

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">
          Buscar propiedad
        </h1>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Sin teclado
        </span>
      </header>

      {/* Wizard */}
      <SearchWizard
        onComplete={(filters, count) => {
          setResults({ filters, count })
        }}
      />
    </div>
  )
}
