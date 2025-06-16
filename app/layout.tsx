import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppLayout } from "@/components/app-layout"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Xdott Contact Intelligence",
  description: "Professional contact discovery and validation tools powered by AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
