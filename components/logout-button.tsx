"use client"

import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"

export function LogoutButton() {
  const { logout, isLoading } = useAuth0()

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
      Logout
    </Button>
  )
}
