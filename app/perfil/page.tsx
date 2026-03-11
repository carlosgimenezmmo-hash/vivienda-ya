"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Coins, Settings, Bookmark, ArrowLeftRight, Grid3X3,
  LogOut, LogIn, ChevronRight, Eye, Heart, FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { UserBadge } from "@/components/user-badge"
import { mockProperties, userLevels } from "@/lib/mock-data"

export default function PerfilPage() {
  const { user, isLoggedIn, toggleAuth } = useAuth()
  const [showLevels, setShowLevels] = useState(false)
  const router = useRouter()

 )
}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">Bienvenido a Vivienda Ya</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Inicia sesion para publicar propiedades, guardar favoritos y gestionar tus creditos
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={toggleAuth}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground"
          >
            Iniciar sesion
          </button>
          <button
            onClick={() => router.push('/registro')}
            className="rounded-xl border border-primary px-8 py-3 text-sm font-semibold text-primary"
          >
            Registrarse
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Demo: toca para simular login</p>
      </div>
    )
  }

  const userProperties = mockProperties.filter((p) => user.properties.includes(p.id))

  const menuItems = [
    { icon: Grid3X3, label: "Mis Publicaciones", count: user.stats.publications, href: "#" },
    { icon: Bookmark, label: "Mi Coleccion", count: user.stats.saved, href: "#" },
    { icon: ArrowLeftRight, label: "Mis Permutas", count: user.stats.permutas, href: "#" },
    { icon: Coins, label: "Creditos", count: user.credits, href: "/perfil/creditos", highlight: true },
    { icon: Settings, label: "Configuracion", href: "#" },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-20">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">Mi Perfil</h1>
        <button
          onClick={toggleAuth}
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Salir
        </button>
      </header>

      {/* Profile card */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-20 w-20 rounded-full border-4 border-primary/20 object-cover"
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <UserBadge level={user.level} size="md" />
            </div>
            <button
              onClick={() => setShowLevels(true)}
              className="mt-1 text-[10px] text-muted-foreground underline"
            >
              Ver sistema de niveles
            </button>
          </div>
        </div>

        {/* Credits quick view */}
        <Link
          href="/perfil/creditos"
          className="mt-4 flex items-center justify-between rounded-2xl bg-vy-gold/5 border border-vy-gold/20 px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-vy-gold" />
            <span className="text-sm font-semibold text-foreground">Mis Creditos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-vy-gold">{user.credits}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "Publicaciones", value: user.stats.publications, icon: FileText },
            { label: "Guardados", value: user.stats.saved, icon: Bookmark },
            { label: "Permutas", value: user.stats.permutas, icon: ArrowLeftRight },
            { label: "Likes", value: user.stats.likes, icon: Heart },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex flex-col items-center rounded-xl bg-secondary p-3">
                <Icon className="mb-1 h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Menu items */}
      <div className="mt-6 px-4">
        <div className="overflow-hidden rounded-2xl border border-border">
          {menuItems.map((item, i) => {
            const Icon = item.icon
            const content = (
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-secondary/50",
                  i < menuItems.length - 1 && "border-b border-border"
                )}
              >
                <Icon className={cn("h-5 w-5", item.highlight ? "text-vy-gold" : "text-muted-foreground")} />
                <span className={cn("flex-1 text-sm font-medium text-foreground", item.highlight && "font-bold")}>
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span className={cn("text-sm", item.highlight ? "font-bold text-vy-gold" : "text-muted-foreground")}>
                    {item.count}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            )

            return item.href !== "#" ? (
              <Link key={item.label} href={item.href}>{content}</Link>
            ) : (
              <button key={item.label} className="w-full text-left">{content}</button>
            )
          })}
        </div>
      </div>

      {/* My properties grid */}
      {userProperties.length > 0 && (
        <div className="mt-6 px-4">
          <h3 className="mb-3 text-sm font-bold text-foreground uppercase tracking-wide">Mis propiedades</h3>
          <div className="grid grid-cols-2 gap-2">
            {userProperties.map((prop) => (
              <div key={prop.id} className="group relative overflow-hidden rounded-xl">
                <img
                  src={prop.imageUrl}
                  alt={prop.title}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2">
                  <p className="text-xs font-semibold text-white leading-tight">{prop.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/70">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {prop.views}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-3 w-3" />
                      {prop.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Levels modal */}
      {showLevels && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowLevels(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-[430px] rounded-t-3xl bg-card px-4 pb-8 pt-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h3 className="mb-4 text-lg font-bold text-foreground">Sistema de Niveles</h3>
            <div className="flex flex-col gap-3">
              {userLevels.map((lvl) => {
                const isCurrentLevel = user.level === lvl.level
                return (
                  <div
                    key={lvl.level}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 p-3",
                      isCurrentLevel ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <UserBadge level={lvl.level as any} size="lg" />
                    <div className="flex-1">
                      <p className={cn("text-sm font-semibold text-foreground", isCurrentLevel && "text-primary")}>
                        {lvl.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {lvl.minPublications === 0
                          ? "Sin publicaciones requeridas"
                          : `${lvl.minPublications}+ publicaciones`}
                      </p>
                    </div>
                    {isCurrentLevel && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                        TU NIVEL
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
