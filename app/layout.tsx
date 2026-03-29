import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { ActivePropertyProvider } from "@/lib/active-property-context"
import { ProtectedActionProvider } from "@/lib/protected-action-context"
import { BottomNav } from "@/components/bottom-nav"
import "./globals.css"

export const metadata: Metadata = {
  title: "ViviendaYa - El primer marketplace de propiedades en video",
  description: "La app tipo TikTok de propiedades inmobiliarias.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
}
export const viewport: Viewport = {
  themeColor: "#000000",
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
      <body style={{ margin: 0, padding: 0, background: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
         <AuthProvider>
           <ActivePropertyProvider>
             <ProtectedActionProvider>
               <div style={{ width: "100%", position: "relative" }}>
                 <main>{children}</main>
                 <BottomNav />
               </div>
             </ProtectedActionProvider>
           </ActivePropertyProvider>
         </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

