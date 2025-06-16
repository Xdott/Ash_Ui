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
  Eye,
  Target,
  Calendar,
} from "lucide-react"
import { LogoutButton } from "./logout"
import SimpleCreditPurchase from "@/components/simple-credit-purchase"

const API_URL = "http://localhost:5000"

interface CreditStats {
  email_validation: number
  phone_number_validation: number
  linkedin_finder: number
  contact_finder: number
  company_finder: number
  company_people_finder: number
  enrichment: number
}

interface DashboardData {
  credits: CreditStats
  has_claimed_free: boolean
  usage_stats?: {
    total_searches_this_month: number
    total_validations_this_month: number
    success_rate: number
    active_tools: number
  }
  recent_activity?: Array<{
    action: string
    time: string
    type: string
  }>
}

// Create a separate component that uses useSearchParams
function HomePageContent() {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [claimingFree, setClaimingFree] = useState(false)
  const [showCreditPurchase, setShowCreditPurchase] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
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

  // Fetch dashboard data
  useEffect(() => {
    if (mounted && isAuthenticated && user?.email) {
      fetchDashboardData()
    }
  }, [mounted, isAuthenticated, user?.email])

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

        // Refresh dashboard data after successful payment
        setTimeout(() => {
          fetchDashboardData()
        }, 1000)

        // Clean up URL after 1 second
        setTimeout(() => {
          window.history.replaceState({}, "", "/")
        }, 1000)
      }
    }
  }, [mounted, searchParams])

  const fetchDashboardData = async () => {
    if (!user?.email) return

    try {
      setLoadingData(true)
      const response = await fetch(`${API_URL}/validation_count?email=${encodeURIComponent(user.email)}`)

      if (response.ok) {
        const data = await response.json()

        // Map the API response to our dashboard data structure
        const mappedData: DashboardData = {
          credits: {
            email_validation: data.available_credits?.email_validation || 0,
            phone_number_validation: data.available_credits?.phone_number_validation || 0,
            linkedin_finder: data.available_credits?.linkedin_finder || 0,
            contact_finder: data.available_credits?.contact_finder || 0,
            company_finder: data.available_credits?.company_finder || 0,
            company_people_finder: data.available_credits?.company_people_finder || 0,
            enrichment: data.available_credits?.enrichment || 0,
          },
          // Check if user has claimed free credits by looking at total credits
          has_claimed_free: Object.values(data.total_credits || {}).some((credit) => credit > 0),
          usage_stats: {
            total_searches_this_month:
              (data.usage_summary?.contact_finder_used || 0) + (data.usage_summary?.linkedin_finder_used || 0),
            total_validations_this_month:
              (data.usage_summary?.email_validation_used || 0) + (data.usage_summary?.phone_validation_used || 0),
            success_rate: 94.8, // You can calculate this from your data if available
            active_tools: Object.values(data.available_credits || {}).filter((credit) => credit > 0).length,
          },
          recent_activity: [
            {
              action: `Contact Finder: ${data.usage_summary?.contact_finder_used || 0} searches used`,
              time: "Today",
              type: "search",
            },
            {
              action: `Email Validation: ${data.usage_summary?.email_validation_used || 0} validations used`,
              time: "Today",
              type: "validation",
            },
            {
              action: `Company Finder: ${data.usage_summary?.company_finder_used || 0} searches used`,
              time: "Today",
              type: "analysis",
            },
            {
              action: `Phone Validation: ${data.usage_summary?.phone_validation_used || 0} validations used`,
              time: "Today",
              type: "validation",
            },
            {
              action: `Company People Finder: ${data.usage_summary?.company_people_finder_used || 0} searches used`,
              time: "Today",
              type: "search",
            },
          ],
        }

        setDashboardData(mappedData)
        console.log("📊 Dashboard data loaded:", mappedData)
      } else {
        console.error("Failed to fetch dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const closeSuccessMessage = () => {
    setShowSuccessMessage(false)
    setSuccessData(null)
  }

  const claimFreeCredits = async () => {
    if (!user?.email) return

    setClaimingFree(true)

    try {
      const response = await fetch(`${API_URL}/claim-free-credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessData({
          credits: data.total_credits.toString(),
          email: user.email,
          packageName: "Free Starter Pack",
          price: "0",
        })
        setShowSuccessMessage(true)

        // Refresh dashboard data
        await fetchDashboardData()
      } else {
        console.error("Failed to claim free credits:", data.error)
      }
    } catch (error) {
      console.error("Error claiming free credits:", error)
    } finally {
      setClaimingFree(false)
    }
  }

  const toggleCreditPurchase = () => {
    setShowCreditPurchase(!showCreditPurchase)
  }

  if (!mounted) {
    return null
  }

  // Show loading state while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Contact Intelligence</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard and tools.</p>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Log In to Continue
          </button>
        </div>
      </div>
    )
  }

  // Calculate real statistics from dashboard data
  const getTotalSearches = () => {
    if (!dashboardData?.credits) return 0
    return (dashboardData.credits.linkedin_finder || 0) + (dashboardData.credits.contact_finder || 0)
  }

  const getTotalValidations = () => {
    if (!dashboardData?.credits) return 0
    return (dashboardData.credits.email_validation || 0) + (dashboardData.credits.phone_number_validation || 0)
  }

  const getActiveTools = () => {
    if (!dashboardData?.credits) return 0
    const credits = dashboardData.credits
    const toolsWithCredits = [
      credits.contact_finder,
      credits.company_finder,
      credits.linkedin_finder,
      credits.email_validation,
      credits.phone_number_validation,
      credits.enrichment,
      credits.company_people_finder,
    ]
    return toolsWithCredits.filter((credit) => (credit || 0) > 0).length
  }

  const tools = [
    {
      name: "Contact Finder",
      description: "Find professional contact information with AI-powered insights",
      icon: User,
      href: "/contact-finder",
      color: "blue",
      stats: `${dashboardData?.credits?.contact_finder || 0} credits`,
    },
    {
      name: "Company Finder",
      description: "Discover comprehensive company information and funding details",
      icon: Building,
      href: "/company-finder",
      color: "purple",
      stats: `${dashboardData?.credits?.company_finder || 0} credits`,
    },
    {
      name: "LinkedIn Finder",
      description: "Find contacts through LinkedIn profile analysis",
      icon: Search,
      href: "/linkedin-finder",
      color: "blue",
      stats: `${dashboardData?.credits?.linkedin_finder || 0} credits`,
    },
    {
      name: "Email Validator",
      description: "Verify email addresses for deliverability and accuracy",
      icon: Mail,
      href: "/email-validator",
      color: "pink",
      stats: `${dashboardData?.credits?.email_validation || 0} credits`,
    },
    {
      name: "Phone Validator",
      description: "Validate phone numbers worldwide with carrier information",
      icon: Phone,
      href: "/phone-validator",
      color: "amber",
      stats: `${dashboardData?.credits?.phone_number_validation || 0} credits`,
    },
    {
      name: "Profile Enrichment",
      description: "Enrich contact profiles with additional data",
      icon: Eye,
      href: "/enrichment",
      color: "green",
      stats: `${dashboardData?.credits?.enrichment || 0} credits`,
    },
    {
      name: "Company People Finder",
      description: "Find people within specific companies",
      icon: Target,
      href: "/company-people-finder",
      color: "violet",
      stats: `${dashboardData?.credits?.company_people_finder || 0} credits`,
    },
    {
      name: "File Upload",
      description: "Upload data files and configure field mapping",
      icon: Upload,
      href: "/upload-contact",
      color: "teal",
      stats: "Bulk processing",
    },
    {
      name: "Contact Dashboard",
      description: "View, edit and manage enriched contact records",
      icon: User,
      href: "/contact-dashboard",
      color: "cyan",
      stats: "Manage contacts",
    },
    {
      name: "Reports & Analytics",
      description: "View analytics and insights from your searches",
      icon: BarChart3,
      href: "/reports",
      color: "emerald",
      stats: "Real-time insights",
    },
  ]

  const quickStats = [
    {
      label: "Search Credits",
      value: loadingData ? "..." : getTotalSearches().toLocaleString(),
      change: "available",
      icon: Search,
      description: "LinkedIn + Contact Finder credits",
    },
    {
      label: "Validation Credits",
      value: loadingData ? "..." : getTotalValidations().toLocaleString(),
      change: "available",
      icon: CheckCircle,
      description: "Email + Phone validation credits",
    },
    {
      label: "Total Used",
      value: loadingData
        ? "..."
        : (
            (dashboardData?.usage_stats?.total_searches_this_month || 0) +
            (dashboardData?.usage_stats?.total_validations_this_month || 0)
          ).toString(),
      change: "this period",
      icon: TrendingUp,
      description: "Total searches and validations used",
    },
    {
      label: "Active Tools",
      value: loadingData ? "..." : getActiveTools().toString(),
      change: "ready",
      icon: Shield,
      description: "Tools with available credits",
    },
  ]

  const recentActivity = dashboardData?.recent_activity || [
    { action: "Contact search completed", time: "2 minutes ago", type: "search" },
    { action: "Company analysis finished", time: "15 minutes ago", type: "analysis" },
    { action: "Email validation batch processed", time: "1 hour ago", type: "validation" },
    { action: "Phone validation completed", time: "2 hours ago", type: "validation" },
    { action: "Profile enrichment completed", time: "3 hours ago", type: "enrichment" },
  ]

  const quickActions = [
    { name: "Find New Contact", href: "/contact-finder", icon: User, color: "blue" },
    { name: "Analyze Company", href: "/company-finder", icon: Building, color: "purple" },
    { name: "LinkedIn Search", href: "/linkedin-finder", icon: Search, color: "blue" },
    { name: "Validate Email", href: "/email-validator", icon: Mail, color: "pink" },
    { name: "Enrich Profile", href: "/enrichment", icon: Eye, color: "green" },
    { name: "Buy Credits", href: "#credits", icon: CreditCard, color: "green" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 relative overflow-hidden">
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
              <p className="text-lg font-semibold text-green-800 mb-1">{successData.packageName}</p>
              <p className="text-green-700">
                {successData.credits} credits {successData.price !== "0" && `for $${successData.price}`}
              </p>
              <p className="text-sm text-green-600 mt-2">Credits have been added to your account</p>
            </div>

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

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Enhanced Welcome Header */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              {user.picture ? (
                <img
                  src={user.picture || "/placeholder.svg"}
                  alt={user.name || "User"}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-2xl">
                Welcome back, {user.name || user.email?.split("@")[0]}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Claim Free Credits Section - Only show if not claimed */}
        {!loadingData && !dashboardData?.has_claimed_free && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-lg border border-emerald-200 p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4 shadow-inner">
                  <Gift className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Get Started Free</h3>
                  <p className="text-sm text-gray-600">Claim 575+ credits across all tools to try our services</p>
                </div>
              </div>
              <button
                onClick={claimFreeCredits}
                disabled={claimingFree}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md disabled:opacity-50"
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
        )}

        {/* Hero Section */}
        <div className="text-center relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-xl mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Contact Intelligence Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive platform for contact discovery, validation, and enrichment
          </p>
        </div>

        {/* Enhanced Quick Stats */}
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
                className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    {stat.change}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Zap className="h-8 w-8 mr-3 text-yellow-500" />
              Your Tools & Credits
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              const hasCredits = tool.stats.includes("credits") && !tool.stats.startsWith("0 credits")

              return (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className={`group relative bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                    hasCredits ? "ring-2 ring-green-200" : ""
                  }`}
                  style={{ transitionDelay: `${300 + index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                          hasCredits
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-600"
                        }`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                    <div
                      className={`text-xs font-medium px-3 py-1 rounded-full inline-block ${
                        hasCredits ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tool.stats}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Credit Purchase Section */}
        <div
          id="credits"
          className={`transition-all duration-1000 transform ${
            animationComplete ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <div
            className="flex items-center justify-between mb-4 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white/20 p-6 cursor-pointer hover:bg-white/90 transition-all duration-300"
            onClick={toggleCreditPurchase}
          >
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 mr-3 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">Purchase Additional Credits</h2>
            </div>
            {showCreditPurchase ? (
              <ChevronUp className="h-6 w-6 text-gray-500" />
            ) : (
              <ChevronDown className="h-6 w-6 text-gray-500" />
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
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors"
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
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-white/20 p-6">
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
                    <button
                      key={action.name}
                      onClick={() => {
                        setShowCreditPurchase(true)
                        document.getElementById("credits")?.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="w-full flex items-center space-x-3 p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors group"
                    >
                      <div className="bg-green-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-900">{action.name}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                  )
                }

                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center space-x-3 p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors group"
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
