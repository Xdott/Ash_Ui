"use client"

import type React from "react"
import { useEffect, useState, Suspense, useMemo, useCallback, memo } from "react"
import Link from "next/link"
import { useAuth0 } from "@auth0/auth0-react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import {
  User,
  Building,
  Upload,
  Mail,
  Phone,
  BarChart3,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Search,
  Shield,
  Loader2,
  CreditCard,
  PartyPopper,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Target,
  Users,
  FileUp,
  Gift,
  Sparkles,
} from "lucide-react"
import { LogoutButton } from "./logout"

// Lazy load heavy components
const SimpleCreditPurchase = dynamic(() => import("@/components/simple-credit-purchase"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />,
  ssr: false,
})

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const CACHE_KEY = "dashboard_data"

// Free credits configuration for new users - Updated to match backend
const FREE_CREDITS_CONFIG = {
  total: 3625, // Updated total: 500*6 + 50 + 75
  distribution: {
    contact_upload: 500,
    email_validation: 500,
    phone_number_validation: 500,
    linkedin_finder: 500,
    contact_finder: 500,
    company_finder: 500,
    company_people_finder: 50, // Lower amount as these are more expensive
    enrichment: 75, // Lower amount
  },
}

interface CreditStats {
  email_validation: number
  phone_number_validation: number
  linkedin_finder: number
  contact_finder: number
  company_finder: number
  company_people_finder: number
  enrichment: number
  contact_upload: number
}

interface TodayUsage {
  contact_finder_today: number
  email_validation_today: number
  phone_number_validation_today: number
  company_finder_today: number
  company_people_finder_today: number
  linkedin_finder_today: number
  enrichment_today: number
  contact_upload_today: number
  total_searches_today: number
  total_validations_today: number
  total_usage_today: number
}

interface DashboardData {
  credits: CreditStats
  has_claimed_free_starter_credits: boolean // Updated field name to match backend logic
  today_usage: TodayUsage | null
  usage_stats?: {
    total_searches_today: number
    total_validations_today: number
    total_usage_today: number
    success_rate: number
    active_tools: number
  }
  recent_activity?: Array<{
    action: string
    time: string
    type: string
  }>
}

// Memoized components for better performance
const QuickStatCard = memo(({ stat, loading }: { stat: any; loading: boolean }) => {
  const Icon = stat.icon
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-600">{stat.label}</p>
        {loading ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
        )}
        <div className="flex items-center text-xs">
          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          <span className="text-green-600 font-medium">{stat.change}</span>
          <span className="text-gray-500 ml-1">{stat.description}</span>
        </div>
      </div>
    </div>
  )
})

const ToolCard = memo(({ tool }: { tool: any }) => {
  const Icon = tool.icon
  const hasCredits = tool.stats.includes("credits") && !tool.stats.startsWith("0 credits")

  return (
    <Link
      key={tool.name}
      href={tool.href}
      className="group border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      prefetch={false}
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <Icon className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{tool.name}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tool.description}</p>
          <div className="mt-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                hasCredits ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {tool.stats}
            </span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </Link>
  )
})

const ActivityItem = memo(({ activity, index }: { activity: any; index: number }) => (
  <div key={`${activity.type}-${index}`} className="flex items-start space-x-3">
    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <CheckCircle className="h-4 w-4 text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-900">{activity.action}</p>
      <p className="text-xs text-gray-500">{activity.time}</p>
    </div>
  </div>
))

// Welcome Banner for New Users
const WelcomeBanner = memo(({ onClaim, claiming }: { onClaim: () => void; claiming: boolean }) => (
  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
          <Gift className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-1">Welcome to Contact Intelligence! 🎉</h3>
          <p className="text-blue-100 text-sm">
            Get started with <strong>FREE STARTER CREDITS</strong> to explore all our tools
          </p>
        </div>
      </div>
      <button
        onClick={onClaim}
        disabled={claiming}
        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
      >
        {claiming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Claiming...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Claim Free Credits</span>
          </>
        )}
      </button>
    </div>
    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
        <div className="font-semibold">500</div>
        <div className="text-blue-100">Contact Finder</div>
      </div>
      <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
        <div className="font-semibold">500</div>
        <div className="text-blue-100">Email Validation</div>
      </div>
      <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
        <div className="font-semibold">500</div>
        <div className="text-blue-100">LinkedIn Finder</div>
      </div>
      <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
        <div className="font-semibold">1,625</div>
        <div className="text-blue-100">More Tools</div>
      </div>
    </div>
  </div>
))

// Cache utilities
const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data
      }
    }
  } catch (error) {
    console.error("Cache read error:", error)
  }
  return null
}

const setCachedData = (key: string, data: any) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    )
  } catch (error) {
    console.error("Cache write error:", error)
  }
}

// Create a separate component that uses useSearchParams
function HomePageContent() {
  const [mounted, setMounted] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [showCreditPurchase, setShowCreditPurchase] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [claimingFreeCredits, setClaimingFreeCredits] = useState(false)
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const searchParams = useSearchParams()

  // Memoized calculations
  const getTotalSearchCredits = useCallback(() => {
    if (!dashboardData?.credits) return 0
    return (
      (dashboardData.credits.linkedin_finder || 0) +
      (dashboardData.credits.contact_finder || 0) +
      (dashboardData.credits.company_finder || 0) +
      (dashboardData.credits.company_people_finder || 0)
    )
  }, [dashboardData?.credits])

  const getTotalValidationCredits = useCallback(() => {
    if (!dashboardData?.credits) return 0
    return (dashboardData.credits.email_validation || 0) + (dashboardData.credits.phone_number_validation || 0)
  }, [dashboardData?.credits])

  const getActiveTools = useCallback(() => {
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
      credits.contact_upload,
    ]
    return toolsWithCredits.filter((credit) => (credit || 0) > 0).length
  }, [dashboardData?.credits])

  // Function to claim free credits for new users
  const claimFreeCredits = useCallback(async () => {
    if (!user?.email || claimingFreeCredits) return

    setClaimingFreeCredits(true)

    try {
      const response = await fetch(`${API_URL}/claim-free-credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Show success message
        setSuccessData({
          credits: result.total_credits?.toString() || FREE_CREDITS_CONFIG.total.toString(),
          email: user.email,
          packageName: "Welcome Package - Free Starter Credits",
          price: "0",
        })
        setShowSuccessMessage(true)

        // Refresh dashboard data
        setTimeout(() => {
          fetchDashboardData(false) // Force fresh data
        }, 1000)

        // Clear cache to ensure fresh data
        localStorage.removeItem(`${CACHE_KEY}_${user.email}`)
      } else {
        const error = await response.json()
        console.error("Failed to claim free credits:", error)

        // Show error message if already claimed
        if (error.error?.includes("already claimed")) {
          // Hide the banner by updating the state
          setDashboardData((prev) => (prev ? { ...prev, has_claimed_free_starter_credits: true } : null))
        }
      }
    } catch (error) {
      console.error("Error claiming free credits:", error)
    } finally {
      setClaimingFreeCredits(false)
    }
  }, [user?.email, claimingFreeCredits])

  // Memoized tools array
  const tools = useMemo(
    () => [
      {
        name: "Contact Finder",
        description: "Find professional contact information with AI-powered insights",
        icon: User,
        href: "/contact-finder",
        stats: `${dashboardData?.credits?.contact_finder || 0} credits`,
      },
      {
        name: "Company Finder",
        description: "Discover comprehensive company information and funding details",
        icon: Building,
        href: "/company-finder",
        stats: `${dashboardData?.credits?.company_finder || 0} credits`,
      },
      {
        name: "LinkedIn Finder",
        description: "Find contacts through LinkedIn profile analysis",
        icon: Search,
        href: "/linkedin-finder",
        stats: `${dashboardData?.credits?.linkedin_finder || 0} credits`,
      },
      {
        name: "Email Validator",
        description: "Verify email addresses for deliverability and accuracy",
        icon: Mail,
        href: "/email-validator",
        stats: `${dashboardData?.credits?.email_validation || 0} credits`,
      },
      {
        name: "Phone Validator",
        description: "Validate phone numbers worldwide with carrier information",
        icon: Phone,
        href: "/phone-validator",
        stats: `${dashboardData?.credits?.phone_number_validation || 0} credits`,
      },
      {
        name: "Profile Enrichment",
        description: "Enrich contact profiles with additional data",
        icon: Eye,
        href: "/enrichment",
        stats: `${dashboardData?.credits?.enrichment || 0} credits`,
      },
      {
        name: "Company People Finder",
        description: "Find people within specific companies",
        icon: Target,
        href: "/company-people-finder",
        stats: `${dashboardData?.credits?.company_people_finder || 0} credits`,
      },
      {
        name: "Contact Upload",
        description: "Upload and process contact files in bulk",
        icon: FileUp,
        href: "/contact-upload",
        stats: `${dashboardData?.credits?.contact_upload || 0} credits`,
      },
      {
        name: "File Upload",
        description: "Upload data files and configure field mapping",
        icon: Upload,
        href: "/upload-contact",
        stats: "Bulk processing",
      },
      {
        name: "Contact Dashboard",
        description: "View, edit and manage enriched contact records",
        icon: Users,
        href: "/contact-dashboard",
        stats: "Manage contacts",
      },
      {
        name: "Reports & Analytics",
        description: "View analytics and insights from your searches",
        icon: BarChart3,
        href: "/reports",
        stats: "Real-time insights",
      },
    ],
    [dashboardData?.credits],
  )

  // Memoized quick stats
  const quickStats = useMemo(
    () => [
      {
        label: "Search Credits",
        value: loadingData ? "..." : getTotalSearchCredits().toLocaleString(),
        change: "+12%",
        changeType: "positive",
        icon: Search,
        description: "available",
      },
      {
        label: "Validation Credits",
        value: loadingData ? "..." : getTotalValidationCredits().toLocaleString(),
        change: "+8%",
        changeType: "positive",
        icon: CheckCircle,
        description: "available",
      },
      {
        label: "Used Today",
        value: loadingData ? "..." : (dashboardData?.usage_stats?.total_usage_today || 0).toString(),
        change: "today",
        changeType: "neutral",
        icon: TrendingUp,
        description: "total actions",
      },
      {
        label: "Active Tools",
        value: loadingData ? "..." : getActiveTools().toString(),
        change: "+23%",
        changeType: "positive",
        icon: Shield,
        description: "with credits",
      },
    ],
    [
      loadingData,
      getTotalSearchCredits,
      getTotalValidationCredits,
      dashboardData?.usage_stats?.total_usage_today,
      getActiveTools,
    ],
  )

  // Fix hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Optimized data fetching with caching and AbortController
  const fetchDashboardData = useCallback(
    async (useCache = true) => {
      if (!user?.email) return

      // Try cache first
      if (useCache) {
        const cachedData = getCachedData(`${CACHE_KEY}_${user.email}`)
        if (cachedData) {
          setDashboardData(cachedData)
          setLoadingData(false)
          // Still fetch fresh data in background
          setTimeout(() => fetchDashboardData(false), 100)
          return
        }
      }

      const abortController = new AbortController()

      try {
        setLoadingData(true)
        const response = await fetch(`${API_URL}/validation_count?email=${encodeURIComponent(user.email)}`, {
          signal: abortController.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (response.ok) {
          const data = await response.json()

          const mappedData: DashboardData = {
            credits: {
              email_validation: data.available_credits?.email_validation || 0,
              phone_number_validation: data.available_credits?.phone_number_validation || 0,
              linkedin_finder: data.available_credits?.linkedin_finder || 0,
              contact_finder: data.available_credits?.contact_finder || 0,
              company_finder: data.available_credits?.company_finder || 0,
              company_people_finder: data.available_credits?.company_people_finder || 0,
              enrichment: data.available_credits?.enrichment || 0,
              contact_upload: data.available_credits?.contact_upload || 0,
            },
            // Check if tenant has claimed "Free Starter Credits" - this is the key logic
            has_claimed_free_starter_credits: data.has_claimed_free_starter_credits || false,
            today_usage: data.usage_today || null,
            usage_stats: {
              total_searches_today: data.usage_today?.total_searches_today || 0,
              total_validations_today: data.usage_today?.total_validations_today || 0,
              total_usage_today: data.usage_today?.total_usage_today || 0,
              success_rate: 94.8,
              active_tools: Object.values(data.available_credits || {}).filter((credit) => credit > 0).length,
            },
            recent_activity: [
              // Generate activity based on today's usage
              ...(data.usage_today?.company_people_finder_today > 0
                ? [
                    {
                      action: `Company People Finder: ${data.usage_today.company_people_finder_today} searches today`,
                      time: "Today",
                      type: "search",
                    },
                  ]
                : []),
              ...(data.usage_today?.contact_finder_today > 0
                ? [
                    {
                      action: `Contact Finder: ${data.usage_today.contact_finder_today} searches today`,
                      time: "Today",
                      type: "search",
                    },
                  ]
                : []),
              ...(data.usage_today?.linkedin_finder_today > 0
                ? [
                    {
                      action: `LinkedIn Finder: ${data.usage_today.linkedin_finder_today} searches today`,
                      time: "Today",
                      type: "search",
                    },
                  ]
                : []),
              // Add fallback if no usage
              ...(!data.usage_today || data.usage_today.total_usage_today === 0
                ? [
                    { action: "Dashboard loaded successfully", time: "Just now", type: "info" },
                    { action: "All tools are ready to use", time: "Today", type: "info" },
                    { action: "Credits available for searches", time: "Today", type: "info" },
                  ]
                : []),
            ],
          }

          setDashboardData(mappedData)
          // Cache the data
          setCachedData(`${CACHE_KEY}_${user.email}`, mappedData)
        } else {
          console.error("Failed to fetch dashboard data")
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching dashboard data:", error)
        }
      } finally {
        setLoadingData(false)
      }

      return () => {
        abortController.abort()
      }
    },
    [user?.email],
  )

  // Fetch dashboard data
  useEffect(() => {
    if (mounted && isAuthenticated && user?.email) {
      fetchDashboardData()
    }
  }, [mounted, isAuthenticated, user?.email, fetchDashboardData])

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
          fetchDashboardData(false) // Force fresh data
        }, 1000)

        // Clean up URL after 1 second
        setTimeout(() => {
          window.history.replaceState({}, "", "/")
        }, 1000)
      }
    }
  }, [mounted, searchParams, fetchDashboardData])

  const closeSuccessMessage = useCallback(() => {
    setShowSuccessMessage(false)
    setSuccessData(null)
  }, [])

  const toggleCreditPurchase = useCallback(() => {
    setShowCreditPurchase((prev) => !prev)
  }, [])

  if (!mounted) {
    return null
  }

  // Show loading state while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Contact Intelligence</h1>
          <p className="text-gray-600 text-sm mb-6">Please log in to access your dashboard and tools.</p>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Log In to Continue
          </button>
        </div>
      </div>
    )
  }

  const recentActivity = dashboardData?.recent_activity || []
  // Show welcome banner only if tenant hasn't claimed "Free Starter Credits"
  const showWelcomeBanner = !dashboardData?.has_claimed_free_starter_credits && !loadingData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message Overlay */}
      {showSuccessMessage && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center relative">
            <button
              onClick={closeSuccessMessage}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="h-6 w-6 text-green-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {successData.price === "0" ? "Free Credits Claimed!" : "Payment Successful!"}
            </h3>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-green-800 mb-1">{successData.packageName}</p>
              <p className="text-sm text-green-700">
                {successData.credits} credits {successData.price !== "0" && `for $${successData.price}`}
              </p>
              <p className="text-xs text-green-600 mt-2">Credits have been added to your account</p>
            </div>

            <button
              onClick={closeSuccessMessage}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
            >
              Start Using Credits
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Main Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of your contact intelligence activities and key metrics.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                {user.picture ? (
                  <img
                    src={user.picture || "/placeholder.svg"}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <User className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.name || user.email?.split("@")[0]}</p>
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Welcome Banner for New Tenants */}
        {showWelcomeBanner && <WelcomeBanner onClaim={claimFreeCredits} claiming={claimingFreeCredits} />}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <QuickStatCard key={stat.label} stat={stat} loading={loadingData} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tools Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Tools & Credits</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tools.slice(0, 8).map((tool) => (
                    <ToolCard key={tool.name} tool={tool} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Today's Activity</h2>
            </div>
            <div className="p-6">
              {loadingData ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <ActivityItem key={`${activity.type}-${index}`} activity={activity} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">No activity today yet</p>
                  <p className="text-xs text-gray-400">Start using your tools to see activity here</p>
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  href="/reports"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  prefetch={false}
                >
                  View all activity
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Purchase Section */}
        <div id="credits" className="bg-white rounded-lg border border-gray-200">
          <div
            className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={toggleCreditPurchase}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-900">Purchase Additional Credits</h2>
              </div>
              {showCreditPurchase ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>

          {showCreditPurchase && (
            <div className="p-6">
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg" />}>
                <SimpleCreditPurchase />
              </Suspense>
            </div>
          )}
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}

export default memo(HomePage)
