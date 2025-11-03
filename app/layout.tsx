import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./src/components/AuthProvider"
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Bizilla Videos - Discover Launch Stories & Product Explainers",
  description: "Explore curated video content from the Bizilla network. Find launch stories, investor updates, and product explainers from innovative companies.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
