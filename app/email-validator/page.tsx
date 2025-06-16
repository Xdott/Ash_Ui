"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Loader2 } from "lucide-react"
import { EmailFinder } from "@/components/email-finder"

export default function EmailFinderPage() {
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0()

  // Fix hydration by ensuring component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="mb-4">You need to be logged in to use the Email Finder.</p>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  return <EmailFinder />
}
