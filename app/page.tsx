"use client"

import type React from "react"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useAuth0 } from "@auth0/auth0-react"
import { useSearchParams } from "next/navigation"
import {
  User,
  Building,
  Upload,
  Mail,
  Phone,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle,
  Zap,
  TrendingUp,
  Activity,
  Search,
  Shield,
  Sparkles,
  Loader2,
  CreditCard,
  PartyPopper,
  X,
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { LogoutButton } from "./logout"
import SimpleCreditPurchase from "@/components/simple-credit-purchase"

// Create a separate component that uses useSearchParams
function HomePageContent() {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [claimingFree, setClaimingFree] = useState(false)
  const [showCreditPurchase, setShowCreditPurchase] = useState(false)
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const searchParams = useSearchParams()

  // Fix hydration
  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle payment success
  useEffect(() => {
    if (mounted && searchParams) {
      const success = searchParams.get("success")
      const credits = searchParams.get("credits")
      const email = searchParams.get("email")
      const packageName = searchParams.get("package")
      const price = searchParams.get("price")

      if (success === "true" && credits && email && packageName && price) {
        setSuccessData({
          credits,
          email,
          packageName,
          price,
        })
        setShowSuccessMessage(true)

        // Clean up URL after 1 second
        setTimeout(() => {
          window.history.replaceState({}, "", "/")
        }, 1000)
      }
    }
  }, [mounted, searchParams])

  // Auto-redirect to Auth0 login if not authenticated
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      loginWithRedirect()
    }
  }, [mounted, isLoading, isAuthenticated, loginWithRedirect])

  const closeSuccessMessage = () => {
    setShowSuccessMessage(false)
    setSuccessData(null)
  }

  const claimFreeCredits = async () => {
    setClaimingFree(true)

    // Simulate API call
    setTimeout(() => {
      setClaimingFree(false)
      setSuccessData({
        credits: "100",
        email: user?.email,
        packageName: "Free Starter",
        price: "0",
      })
      setShowSuccessMessage(true)
    }, 1500)
  }

  const toggleCreditPurchase = () => {
    setShowCreditPurchase(!showCreditPurchase)
  }

  if (!mounted) {
    return null
  }

  // Show loading state while auth is loading OR while redirecting to login
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 text-lg">{isLoading ? "Loading..." : "Redirecting to login..."}</p>
        </div>
      </div>
    )
  }

  const tools = [
    {
      name: "Contact Finder",
      description: "Find professional contact information with AI-powered insights",
      icon: User,
      href: "/contact-finder",
      color: "blue",
      stats: "10K+ contacts found",
    },
    {
      name: "Company Finder",
      description: "Discover comprehensive company information and funding details",
      icon: Building,
      href: "/company-finder",
      color: "purple",
      stats: "5K+ companies analyzed",
    },
    {
      name: "File Upload",
      description: "Upload data files and configure field mapping",
      icon: Upload,
      href: "/file-upload",
      color: "teal",
      stats: "Custom upload mapping",
    },
    {
      name: "Contact Dashboard",
      description: "View, edit and manage enriched contact records",
      icon: User,
      href: "/contact-dashboard",
      color: "cyan",
      stats: "Contacts overview",
    },
    {
      name: "Company Dashboard",
      description: "Manage and enrich company records",
      icon: Building,
      href: "/company-dashboard",
      color: "orange",
      stats: "Companies managed",
    },
    {
      name: "Upload Contact",
      description: "Bulk upload and validate contact information from CSV files",
      icon: Upload,
      href: "/upload-contact",
      color: "indigo",
      stats: "Batch processing",
    },
    {
      name: "Email Validator",
      description: "Verify email addresses for deliverability and accuracy",
      icon: Mail,
      href: "/email-validator",
      color: "pink",
      stats: "25K+ emails validated",
    },
    {
      name: "Email Finder",
      description: "Advanced email validation with confidence scoring and deliverability analysis",
      icon: Search,
      href: "/email-finder",
      color: "purple",
      stats: "Advanced validation",
    },
    {
      name: "Phone Validator",
      description: "Validate phone numbers worldwide with carrier information",
      icon: Phone,
      href: "/phone-validator",
      color: "amber",
      stats: "Global coverage",
    },
    {
      name: "Reports & Analytics",
      description: "View analytics and insights from your searches",
      icon: BarChart3,
      href: "/reports",
      color: "emerald",
      stats: "Real-time analytics",
    },
  ]

  const quickStats = [
    { label: "Total Searches", value: "1,247", change: "+12%", icon: Search },
    { label: "Success Rate", value: "94.8%", change: "+2.1%", icon: CheckCircle },
    { label: "This Month", value: "342", change: "+18%", icon: TrendingUp },
    { label: "Active Tools", value: "7", change: "+1", icon: Shield },
  ]

  const recentActivity = [
    { action: "Contact search completed", time: "2 minutes ago" },
    { action: "Company analysis finished", time: "15 minutes ago" },
    { action: "Email validation batch processed", time: "1 hour ago" },
    { action: "Phone validation completed", time: "2 hours ago" },
    { action: "Profile enrichment completed", time: "3 hours ago" },
  ]

  const quickActions = [
    { name: "Find New Contact", href: "/contact-finder", icon: User, color: "blue" },
    { name: "Analyze Company", href: "/company-finder", icon: Building, color: "purple" },
    { name: "Bulk Upload", href: "/upload-contact", icon: Upload, color: "indigo" },
    { name: "Validate Email", href: "/email-validator", icon: Mail, color: "pink" },
    { name: "Find Email", href: "/email-finder", icon: Search, color: "purple" },
    { name: "Buy Credits", href: "#credits", icon: CreditCard, color: "green" },
  ]

  return (
    <div className="min-h-screen bg-white py-12 px-4 relative overflow-hidden">
      {/* Success Message Overlay */}
      {showSuccessMessage && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative animate-in fade-in duration-300">
            <button
              onClick={closeSuccessMessage}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="h-8 w-8 text-green-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 {successData.price === "0" ? "Credits Claimed!" : "Payment Successful!"}
            </h3>

            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-lg font-semibold text-green-800 mb-1">{successData.packageName} Package</p>
              <p className="text-green-700">
                {successData.credits} credits {successData.price !== "0" && `for $${successData.price}`}
              </p>
              <p className="text-sm text-green-600 mt-2">Credits have been added to your account</p>
            </div>

            <p className="text-gray-600 mb-6">
              {successData.price === "0"
                ? "Your free credits are now available across all tools."
                : "Thank you for your purchase! Your credits are now available across all tools."}
            </p>

            <button
              onClick={closeSuccessMessage}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors w-full"
            >
              Start Using Credits
            </button>
          </div>
        </div>
      )}

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Simple Welcome Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              {user.picture ? (
                <img
                  src={user.picture || "/placeholder.svg"}
                  alt={user.name || "User"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-gray-900 font-semibold text-xl">Welcome back, {user.name || user.email}</h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Claim Free Credits Section - NEW */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-lg border border-emerald-200 p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4 shadow-inner">
                <Gift className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Get Started Free</h3>
                <p className="text-sm text-gray-600">Claim 100 credits of each type to try our services</p>
              </div>
            </div>
            <button
              onClick={claimFreeCredits}
              disabled={claimingFree}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md"
            >
              {claimingFree ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                  Claiming...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 inline" />
                  Claim Free Credits
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center relative mt-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-xl mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Contact Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access your professional contact tools and view real-time insights
          </p>
        </div>

        {/* Quick Stats */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 transform ${
            animationComplete ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      stat.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Tools Section */}
        <div
          className={`transition-all duration-1000 transform ${
            animationComplete ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-yellow-500" />
              Premium Tools
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-700 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                    <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                      {tool.stats}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Credit Purchase Section - COLLAPSED */}
        <div
          id="credits"
          className={`transition-all duration-1000 transform ${
            animationComplete ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <div
            className="flex items-center justify-between mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:bg-gray-50"
            onClick={toggleCreditPurchase}
          >
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900">Purchase Credits</h2>
            </div>
            {showCreditPurchase ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>

          {showCreditPurchase && (
            <div className="mt-4">
              <SimpleCreditPurchase />
            </div>
          )}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-1000 transform ${
            animationComplete ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/reports"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all activity
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                const isCreditsAction = action.href === "#credits"

                if (isCreditsAction) {
                  return (
                    <a
                      key={action.name}
                      href={action.href}
                      onClick={(e) => {
                        e.preventDefault()
                        setShowCreditPurchase(true)
                        document.getElementById("credits")?.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="bg-green-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-900">{action.name}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </a>
                  )
                }

                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{action.name}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense
const HomePage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}

export default HomePage
