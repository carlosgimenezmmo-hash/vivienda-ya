import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { ProtectedActionProvider } from "@/lib/protected-action-context"
import { BottomNav } from "@/components/bottom-nav"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vivienda Ya - Propiedades como nunca las viste",
  description:
    "La app tipo TikTok de propiedades inmobiliarias. Busca, publica y permuta casas, departamentos y mas con video verificado ARRYSE.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthProvider>
          <ProtectedActionProvider>
           <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col shadow-2xl">
              <main className="flex-1">{children}</main>
              <BottomNav />
            </div>
          </ProtectedActionProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
