"use client"

import type { ReactNode } from "react"
import { Auth0Provider } from "@auth0/auth0-react"
import { ThemeProvider } from "@/components/theme-provider"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Get Auth0 credentials from environment variables
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ""
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ""

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== "undefined" ? window.location.origin : "",
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </Auth0Provider>
  )
}
