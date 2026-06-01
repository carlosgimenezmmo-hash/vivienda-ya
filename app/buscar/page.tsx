"use client"

import { useState } from "react"
import { SearchWizard } from "@/components/search-wizard"

export default function BuscarPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <SearchWizard />
    </div>
  )
}