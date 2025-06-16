"use client"

import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function LoginButton() {
  const { loginWithRedirect, isLoading } = useAuth0()

  return (
    <Button
      onClick={() => loginWithRedirect()}
      disabled={isLoading}
      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        "Log In"
      )}
    </Button>
  )
}
