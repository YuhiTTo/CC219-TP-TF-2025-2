import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css" 

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Análisis de Reseñas - Amazon Fine Food",
  description: "Análisis de sentimientos con modelos ML",
  //generator: "Next.js",
  icons: {
    icon: [
      {
        url: "/icon-light-32x321.jpeg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x321.jpeg",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon1.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon1.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
