"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { translations } from "@/lib/translations"
import {
  ArrowLeft, Coins, Star, Bell, Repeat, ArrowUp, CheckCircle,
  BarChart3, Bot, Video, Folder, Clock, Archive, FolderOpen,
  Gift, ShieldCheck, UserPlus, Heart, Share2, User, MessageSquare,
  Flame, TrendingUp, ChevronDown, ChevronUp, Plus, Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useProtectedAction } from "@/lib/protected-action-context"
import { creditPacks, creditProducts, creditRewards } from "@/lib/mock-data"

const productIconMap: Record<string, typeof Star> = {
  star: Star,
  bell: Bell,
  repeat: Repeat,
  "arrow-up": ArrowUp,
  "check-circle": CheckCircle,
  "bar-chart": BarChart3,
  bot: Bot,
  video: Video,
  folder: Folder,
  clock: Clock,
  folders: FolderOpen,
  archive: Archive,
}

const rewardIconMap: Record<string, typeof Gift> = {
  "Verificacion ARRYSE": ShieldCheck,
  "Invitar amigo": UserPlus,
  "Primera publicacion": Star,
  "10 likes en 1 video": Heart,
  "Compartir en redes": Share2,
  "Completar perfil 100%": User,
  "Review de visita": MessageSquare,
  "Racha 7 dias": Flame,
  "Subir de nivel": TrendingUp,
}

type WalletTab = "gastar" | "ganar" | "historial"

export default function CreditosPage() {
  const { user, transactions, addCredits, spendCredits } = useAuth()
  const { handleProtectedAction } = useProtectedAction()
  const [activeTab, setActiveTab] = useState<WalletTab>("gastar")
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>("visibilidad")
  const [lang, setLang] = useState<"es" | "pt">(() => {
    if (typeof navigator !== "undefined") {
      return navigator.language.startsWith("pt") ? "pt" : "es"
    }
    return "es"
  })
  const t = translations[lang]

  if (!user) return null

  const categories = [
    { id: "visibilidad", label: "Visibilidad", description: "Destaca tu propiedad" },
    { id: "herramientas", label: "Herramientas", description: "Potencia tu cuenta" },
    { id: "biblioteca", label: "Biblioteca", description: "Gestiona tus videos" },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link href="/perfil" className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Mis Creditos</h1>
      </header>

      {/* Balance card */}
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-vy-blue to-vy-blue-light p-5 text-white">
        <p className="text-xs font-medium text-white/70">Saldo disponible</p>
        <div className="mt-1 flex items-end gap-2">
          <Coins className="h-8 w-8 text-vy-gold" />
          <span className="text-4xl font-bold leading-none">{user.credits}</span>
          <span className="mb-1 text-sm text-white/70">creditos</span>
        </div>
        <button
          onClick={() => handleProtectedAction('Comprar Créditos', () => setShowBuyModal(true))}
          className="mt-4 w-full rounded-xl bg-white/20 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors active:bg-white/30"
        >
          {t.buy_credits}
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex border-b border-border">
        {[
          { id: "gastar" as WalletTab, label: "Gastar" },
          { id: "ganar" as WalletTab, label: "Ganar gratis" },
          { id: "historial" as WalletTab, label: "Historial" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 py-4">
        {/* GASTAR */}
        {activeTab === "gastar" && (
          <div className="flex flex-col gap-4">
            {categories.map((cat) => {
              const isExpanded = expandedCategory === cat.id
              const products = creditProducts.filter((p) => p.category === cat.id)

              return (
                <div key={cat.id} className="overflow-hidden rounded-2xl border border-border">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                    className="flex w-full items-center justify-between bg-card px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-foreground">{cat.label}</p>
                      <p className="text-[10px] text-muted-foreground">{cat.description}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="divide-y divide-border border-t border-border">
                      {products.map((product) => {
                        const Icon = productIconMap[product.icon] || Star
                        const canAfford = user.credits >= product.cost

                        return (
                          <div key={product.id} className="flex items-center gap-3 bg-card px-4 py-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{product.name}</p>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{product.description}</p>
                              <p className="text-[10px] text-muted-foreground/60">{product.duration}</p>
                            </div>
                            <button
                              onClick={() => handleProtectedAction('Comprar Créditos', () => {
                                if (canAfford) spendCredits(product.cost, product.name)
                              })}
                              disabled={!canAfford}
                              className={cn(
                                "flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                                canAfford
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground opacity-50"
                              )}
                            >
                              <Coins className="h-3 w-3" />
                              {product.cost}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* GANAR */}
        {activeTab === "ganar" && (
          <div className="flex flex-col gap-2">
            <p className="mb-2 text-xs text-muted-foreground">
              Completa estas acciones para ganar creditos gratis
            </p>
            {creditRewards.map((reward) => {
              const Icon = rewardIconMap[reward.action] || Gift
              return (
                <div
                  key={reward.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vy-green/10">
                    <Icon className="h-5 w-5 text-vy-green" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{reward.action}</p>
                    <p className="text-[10px] text-muted-foreground">{reward.condition}</p>
                    <p className="text-[10px] text-muted-foreground/60">{reward.limit}</p>
                  </div>
                  <span className="flex items-center gap-0.5 rounded-full bg-vy-green/10 px-2.5 py-1 text-xs font-bold text-vy-green">
                    <Plus className="h-3 w-3" />
                    {reward.reward}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* HISTORIAL */}
        {activeTab === "historial" && (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    tx.type === "compra" && "bg-vy-blue/10",
                    tx.type === "recompensa" && "bg-vy-green/10",
                    tx.type === "gasto" && "bg-red-500/10"
                  )}
                >
                  {tx.type === "compra" && <Plus className="h-4 w-4 text-vy-blue" />}
                  {tx.type === "recompensa" && <Gift className="h-4 w-4 text-vy-green" />}
                  {tx.type === "gasto" && <Minus className="h-4 w-4 text-red-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{tx.description}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold",
                    tx.amount > 0 ? "text-vy-green" : "text-red-500"
                  )}
                >
                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buy credits modal */}
      {showBuyModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowBuyModal(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-[430px] rounded-t-3xl bg-card px-4 pb-8 pt-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h3 className="mb-1 text-lg font-bold text-foreground">{t.buy_credits}</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              {lang === "es"
                ? "Elige un pack. 1 credito = USD $1.25"
                : "Escolha um pacote. 1 crédito = USD $1.25"}
            </p>
            <div className="flex flex-col gap-3">
              {creditPacks.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => {
                    addCredits(pack.credits, `Compra: ${pack.name} (${pack.credits} creditos)`, pack.priceUSD)
                    setShowBuyModal(false)
                  }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98]",
                    pack.popular
                      ? "border-vy-blue bg-vy-blue/5"
                      : "border-border bg-card"
                  )}
                >
                  {pack.popular && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-vy-blue px-2.5 py-0.5 text-[10px] font-bold text-white">
                      POPULAR
                    </span>
                  )}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-vy-gold/10">
                    <Coins className="h-6 w-6 text-vy-gold" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {pack.credits} {pack.credits === 1 ? "credito" : "creditos"}
                      </span>
                      {pack.savings && (
                        <span className="rounded-full bg-vy-green/10 px-2 py-0.5 text-[10px] font-bold text-vy-green">
                          -{pack.savings}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      USD ${pack.pricePerCredit.toFixed(2)} por credito
                    </p>
                  </div>
                  <span className="text-base font-bold text-foreground">
                    ${pack.priceUSD.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-[10px] text-muted-foreground">
              Demo: los creditos se agregan inmediatamente al tocar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
