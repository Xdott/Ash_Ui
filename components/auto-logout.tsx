"use client"

import { useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"

const AutoLogout = () => {
  const { logout, isAuthenticated } = useAuth0()

  useEffect(() => {
    if (!isAuthenticated) return

    let timeout: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timeout)
      timeout = setTimeout(
        () => {
          logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          })
        },
        60 * 60 * 1000,
      ) // 5 minutes of inactivity
    }

    // Events that indicate user activity
    const activityEvents = ["mousemove", "keydown", "scroll", "touchstart", "click"]

    // Add event listeners for user activity
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }))

    // Initialize the timer
    resetTimer()

    // Cleanup function
    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer))
      clearTimeout(timeout)
    }
  }, [isAuthenticated, logout])

  return null
}

export default AutoLogout
