"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { usePathname } from "next/navigation"
import {
  Phone,
  User,
  Building2,
  Mail,
  BarChart3,
  Home,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Settings,
  HelpCircle,
  Sparkles,
  CreditCard,
  Users,
  Building,
  Database,
} from "lucide-react"
import AutoLogout from "./auto-logout"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated, user, loginWithRedirect, logout, isLoading } = useAuth0()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Main navigation sections
  const mainNavigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Data Sources", href: "/upload-contact", icon: Database },
    { name: "Contacts", href: "/contact-dashboard", icon: Users },
    { name: "Companies", href: "/company-dashboard", icon: Building },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ]

  // Governance section - All tools moved here
  const governanceNavigation = [
    { name: "Contact Finder", href: "/contact-finder", icon: User },
    { name: "Company Finder", href: "/company-finder", icon: Building2 },
    { name: "Email Validator", href: "/email-validator", icon: Mail },
    { name: "People Finder", href: "/people-finder", icon: Users },
    { name: "Phone Validator", href: "/phone-validator", icon: Phone },
  ]

  // Subscription section
  const subscriptionNavigation = [
    { name: "Buy Credits", href: "/buy-credits", icon: CreditCard },
  ]

  // Bottom navigation
  const bottomNavigation = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help", href: "/help", icon: HelpCircle },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Sync user with backend
  useEffect(() => {
    if (isAuthenticated && user && API_URL) {
      const syncUser = async () => {
        try {
          const res = await fetch(`${API_URL}/sync_auth0_user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, name: user.name }),
          })

          if (!res.ok) {
            console.error("Failed to sync user")
          }
        } catch (error) {
          console.error("Error syncing user:", error)
        }
      }

      syncUser()
    }
  }, [isAuthenticated, user])

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }

  // Helper function to render navigation section
  const renderNavSection = (title: string, items: Array<{name: string, href: string, icon: any}>, className = "") => (
    <div className={`space-y-1 ${className}`}>
      {title && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mx-2 ${
              isActive
                ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon
              className={`mr-3 flex-shrink-0 h-4 w-4 ${
                isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500"
              }`}
            />
            {item.name}
          </Link>
        )
      })}
    </div>
  )

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <main>{children}</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Auto Logout Component */}
      <AutoLogout />

      {/* 🎯 VERTICAL SIDEBAR NAVIGATION - CRM Style */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {/* Company Name */}
              <div>
                <h1 className="text-lg font-bold text-gray-900">XDOTT CRM</h1>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 space-y-6">
            {/* Main Section */}
            {renderNavSection("Main", mainNavigation)}

            {/* Governance Section - All tools */}
            {renderNavSection("Governance", governanceNavigation, "pt-4 border-t border-gray-100")}

            {/* Subscription Section */}
            {renderNavSection("Subscription", subscriptionNavigation, "pt-4 border-t border-gray-100")}
          </nav>

          {/* Bottom Navigation */}
          <div className="flex-shrink-0 space-y-1 pt-4 border-t border-gray-100">
            {bottomNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mx-2 ${
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-4 w-4 ${
                      isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* User Profile Section */}
          <div className="flex-shrink-0 px-2 mt-4 border-t border-gray-100 pt-4" ref={menuRef}>
            {isLoading ? (
              <div className="text-xs text-gray-500 px-3 py-2">Loading...</div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="group w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {user.picture ? (
                    <img
                      src={user.picture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}

                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-gray-900 truncate text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">Admin</div>
                  </div>

                  <ChevronDown className="h-4 w-4 text-gray-400 ml-2 transform group-hover:rotate-180 transition-transform" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? "fixed inset-0 z-40" : ""}`}>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        )}

        <div
          className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">XDOTT CRM</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-2 space-y-6 overflow-y-auto py-4">
            {/* Mobile Navigation - Same structure as desktop */}
            {renderNavSection("Main", mainNavigation)}
            {renderNavSection("Governance", governanceNavigation, "pt-4 border-t border-gray-100")}
            {renderNavSection("Subscription", subscriptionNavigation, "pt-4 border-t border-gray-100")}
          </nav>

          {/* Mobile Bottom Navigation */}
          <div className="flex-shrink-0 px-2 space-y-1 border-t border-gray-100 pt-4">
            {bottomNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-4 w-4 ${
                      isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">XDOTT CRM</h1>
          </div>

          {/* Mobile user menu */}
          <div className="relative" ref={menuRef}>
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-1 rounded-full hover:bg-gray-100"
                >
                  {user.picture ? (
                    <img
                      src={user.picture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">Admin</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Log In
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}