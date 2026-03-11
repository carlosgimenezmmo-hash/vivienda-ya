// ===== TIPOS PRINCIPALES - VIVIENDA YA =====

export type OperationType = "venta" | "alquiler" | "permuta" | "temporario"

export type PropertyType =
  | "casa"
  | "departamento"
  | "ph"
  | "cabana"
  | "quinta"
  | "terreno"
  | "local"
  | "oficina"
  | "galpon"
  | "campo"

export type PropertyCondition = "a-estrenar" | "muy-bueno" | "bueno" | "a-reciclar"

export type ArryseMode = "clasico" | "express" | "pro"

export type UserLevel =
  | "visitante"
  | "basico"
  | "propietario"
  | "propietario-plus"
  | "inmobiliaria"
  | "top"

export interface Property {
  id: string
  title: string
  operation: OperationType
  type: PropertyType
  condition: PropertyCondition
  price: number
  currency: "USD" | "ARS"
  location: {
    province: string
    city: string
    neighborhood: string
    lat?: number
    lng?: number
  }
  rooms: number
  bedrooms: number
  bathrooms: number
  area: number // m2
  features: string[]
  imageUrl: string
  arryseVerified: boolean
  arryseMode?: ArryseMode
  owner: PropertyOwner
  matchPercentage: number
  isHighlighted: boolean
  likes: number
  views: number
  createdAt: string
}

export interface PropertyOwner {
  id: string
  name: string
  avatar: string
  level: UserLevel
  verified: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  level: UserLevel
  credits: number
  stats: {
    publications: number
    saved: number
    permutas: number
    likes: number
  }
  properties: string[] // property IDs
  isLoggedIn: boolean
}

export interface Chat {
  id: string
  contactName: string
  contactAvatar: string
  lastMessage: string
  timestamp: string
  unread: number
  propertyId?: string
}

export interface Notification {
  id: string
  type: "like" | "message" | "match" | "credit" | "system" | "arryse"
  title: string
  description: string
  timestamp: string
  read: boolean
}

// ===== SISTEMA DE CREDITOS =====

export interface CreditPack {
  id: string
  name: string
  credits: number
  priceUSD: number
  pricePerCredit: number
  savings: string
  popular?: boolean
}

export interface CreditProduct {
  id: string
  name: string
  cost: number
  description: string
  duration: string
  icon: string
  category: "visibilidad" | "herramientas" | "biblioteca"
}

export interface CreditReward {
  id: string
  action: string
  reward: number
  condition: string
  limit: string
}

export interface Transaction {
  id: string
  type: "compra" | "gasto" | "recompensa"
  description: string
  amount: number // positivo = ganado, negativo = gastado
  date: string
  balanceAfter: number
}

// ===== ARRYSE =====

export interface ArryseStep {
  id: number
  label: string
  instruction: string
  duration: number // seconds
  icon: string
}

export interface ArryseRecording {
  mode: ArryseMode
  steps: ArryseStep[]
  totalDuration: number
  costCredits: number
}

// ===== BUSQUEDA =====

export interface SearchFilters {
  operation?: OperationType
  type?: PropertyType
  province?: string
  city?: string
  neighborhood?: string
  priceMin?: number
  priceMax?: number
  currency?: "USD" | "ARS"
  rooms?: number
  bedrooms?: number
  bathrooms?: number
  features?: string[]
  condition?: PropertyCondition
}

// ===== NAVEGACION =====

export type TabId = "inicio" | "buscar" | "publicar" | "inbox" | "perfil"
