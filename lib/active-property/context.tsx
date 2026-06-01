"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ActiveProperty {
  id: number
  title: string
  whatsapp_number: string
}

interface ActivePropertyContextType {
  activeProperty: ActiveProperty | null
  setActiveProperty: (p: ActiveProperty | null) => void
}

const ActivePropertyContext = createContext<ActivePropertyContextType>({
  activeProperty: null,
  setActiveProperty: () => {},
})

export function ActivePropertyProvider({ children }: { children: ReactNode }) {
  const [activeProperty, setActiveProperty] = useState<ActiveProperty | null>(null)
  return (
    <ActivePropertyContext.Provider value={{ activeProperty, setActiveProperty }}>
      {children}
    </ActivePropertyContext.Provider>
  )
}

export function useActiveProperty() {
  return useContext(ActivePropertyContext)
}