"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import {
  User,
  SettingsIcon,
  BarChart3,
  CreditCard,
  Phone,
  Building2,
  Bell,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertCircle,
  Users,
  Search,
  Upload,
  Mail,
  Sparkles,
  UserCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import SimpleCreditPurchase from "@/components/simple-credit-purchase"
import { Alert, AlertDescription } from "@/components/ui/alert"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ValidationStats {
  user_validation_count: number
  distinct_email_count: number
  company_finder_count: number
  phone_validation_count: number
  company_people_finder_count: number
  tenant_info: {
    tenant_id: number
    tenant_name: string
    tenant_domain: string
  }
  total_credits: {
    email_validation: number
    phone_number_validation: number
    linkedin_finder: number
    contact_finder: number
    company_finder: number
    company_people_finder: number
    enrichment: number
  }
  available_credits: {
    email_validation: number
    phone_number_validation: number
    linkedin_finder: number
    contact_finder: number
    company_finder: number
    company_people_finder: number
    enrichment: number
  }
  usage_summary: {
    contact_finder_used: number
    email_validation_used: number
    phone_validation_used: number
    company_finder_used: number
    company_people_finder_used: number
  }
}

interface UserSettings {
  email_notifications: boolean
  marketing_emails: boolean
  auto_logout_minutes: number
  theme_preference: string
  timezone: string
}

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth0()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<"profile" | "stats" | "credits" | "preferences">("profile")
  const [validationStats, setValidationStats] = useState<ValidationStats | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings>({
    email_notifications: true,
    marketing_emails: false,
    auto_logout_minutes: 30,
    theme_preference: "light",
    timezone: "UTC",
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch validation stats using the real API endpoint
  useEffect(() => {
    if (isAuthenticated && user?.email && API_URL) {
      fetchValidationStats()
    }
  }, [isAuthenticated, user])

  const fetchValidationStats = async () => {
    if (!user?.email) return

    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Fetching validation stats for:", user.email)
      const response = await fetch(`${API_URL}/validation_count?email=${encodeURIComponent(user.email)}`)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unexpected response format. Not JSON.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API returned status ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Validation stats received:", data)
      setValidationStats(data)
    } catch (error: any) {
      console.error("💥 Error fetching validation stats:", error)
      setError(error.message || "Failed to fetch statistics")

      // Use mock data on error that matches the real data structure
      setValidationStats({
        user_validation_count: 101,
        distinct_email_count: 56,
        company_finder_count: 2,
        phone_validation_count: 9,
        company_people_finder_count: 0,
        tenant_info: {
          tenant_id: 4,
          tenant_name: "Sunmartech",
          tenant_domain: "sunmartech.com",
        },
        total_credits: {
          email_validation: 318,
          phone_number_validation: 246,
          linkedin_finder: 236,
          contact_finder: 250,
          company_finder: 198,
          company_people_finder: 73,
          enrichment: 50,
        },
        available_credits: {
          email_validation: 262,
          phone_number_validation: 237,
          linkedin_finder: 236,
          contact_finder: 250,
          company_finder: 196,
          company_people_finder: 73,
          enrichment: 50,
        },
        usage_summary: {
          contact_finder_used: 101,
          email_validation_used: 56,
          phone_validation_used: 9,
          company_finder_used: 2,
          company_people_finder_used: 0,
        },
      })
    }
    setLoading(false)
  }

  const saveSettings = async () => {
    if (!user?.email) return

    setSaving(true)
    try {
      if (API_URL) {
        const response = await fetch(`${API_URL}/user-settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            settings: userSettings,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save settings")
        }
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
    setSaving(false)
  }

  // Calculate total usage across all services
  const getTotalUsage = () => {
    if (!validationStats) return 0
    return (
      validationStats.usage_summary.contact_finder_used +
      validationStats.usage_summary.phone_validation_used +
      (validationStats.usage_summary.linkedin_used || 0) +
      validationStats.usage_summary.email_validation_used +
      validationStats.usage_summary.company_finder_used +
      validationStats.usage_summary.company_people_finder_used
    )
  }

  // Calculate total available credits
  const getTotalAvailable = () => {
    if (!validationStats) return 0
    return Object.values(validationStats.available_credits).reduce((sum, credits) => sum + credits, 0)
  }

  // Calculate total credits purchased
  const getTotalCredits = () => {
    if (!validationStats) return 0
    return Object.values(validationStats.total_credits).reduce((sum, credits) => sum + credits, 0)
  }

  // Check if tenant is a business domain
  const isBusinessDomain = () => {
    if (!validationStats?.tenant_info?.tenant_domain) return false

    const domain = validationStats.tenant_info.tenant_domain.toLowerCase()
    const personalDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "live.com",
      "icloud.com",
      "aol.com",
    ]

    return !personalDomains.some((pd) => domain.includes(pd))
  }

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access your settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "credits", label: "Credits", icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: SettingsIcon },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  {user?.picture ? (
                    <img
                      src={user.picture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{user?.name || "User"}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    {validationStats?.tenant_info && (
                      <p className="text-sm text-gray-500">Organization: {validationStats.tenant_info.tenant_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={user?.name || ""} disabled />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user?.email || ""} disabled />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">API Access</h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value="sk-1234567890abcdef"
                      disabled
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Use this API key to integrate with our services</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "stats":
        return (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-600">Loading statistics...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="max-w-lg mx-auto">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : validationStats ? (
              <>
                {/* Tenant Info Card - Only show for business domains */}
                {isBusinessDomain() && (
                  <Card className="shadow-md border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Building2 className="h-5 w-5 text-indigo-600 mr-2" />
                        <h2 className="text-lg font-bold">Organization Info</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Organization</p>
                          <p className="text-lg font-semibold">{validationStats.tenant_info.tenant_name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Domain</p>
                          <p className="text-lg font-semibold">{validationStats.tenant_info.tenant_domain || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Available Credits Card */}
                <Card className="shadow-md border-0 bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <CreditCard className="h-5 w-5 text-emerald-600 mr-2" />
                      <h2 className="text-lg font-bold">Available Credits</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Contact Upload</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {validationStats.available_credits.contact_finder || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Phone Validation</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {validationStats.available_credits.phone_number_validation || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">LinkedIn Finder</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {validationStats.available_credits.linkedin_finder || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Contact Finder</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {validationStats.available_credits.contact_finder || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Company Finder</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {validationStats.available_credits.company_finder || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Email Validation</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {validationStats.available_credits.email_validation || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">People Finder</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {validationStats.available_credits.company_people_finder || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <Card className="shadow-md border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Upload className="h-5 w-5 text-purple-600 mr-2" />
                        <h2 className="text-lg font-bold">Contact Upload</h2>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Contacts Uploaded</p>
                          <p className="text-3xl font-bold">{validationStats.user_validation_count}</p>
                        </div>
                        <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>

                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${Math.min((validationStats.user_validation_count / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Phone className="h-5 w-5 text-orange-600 mr-2" />
                        <h2 className="text-lg font-bold">Phone Validation</h2>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Phone Numbers</p>
                          <p className="text-3xl font-bold">{validationStats.phone_validation_count || 0}</p>
                        </div>
                        <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                          <Phone className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>

                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600 rounded-full"
                          style={{
                            width: `${Math.min(((validationStats.phone_validation_count || 0) / 100) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <h2 className="text-lg font-bold">Contact Finder</h2>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Contacts Found</p>
                          <p className="text-3xl font-bold">{validationStats.usage_summary.contact_finder_used || 0}</p>
                        </div>
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>

                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${Math.min(((validationStats.usage_summary.contact_finder_used || 0) / 50) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Building2 className="h-5 w-5 text-green-600 mr-2" />
                        <h2 className="text-lg font-bold">Company Finder</h2>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Companies Found</p>
                          <p className="text-3xl font-bold">{validationStats.company_finder_count || 0}</p>
                        </div>
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-green-600" />
                        </div>
                      </div>

                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{
                            width: `${Math.min(((validationStats.company_finder_count || 0) / 50) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Mail className="h-5 w-5 text-red-600 mr-2" />
                        <h2 className="text-lg font-bold">Email Validation</h2>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Emails Validated</p>
                          <p className="text-3xl font-bold">{validationStats.distinct_email_count || 0}</p>
                        </div>
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                          <Mail className="h-8 w-8 text-red-600" />
                        </div>
                      </div>

                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{
                            width: `${Math.min(((validationStats.distinct_email_count || 0) / 50) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
                        <h2 className="text-lg font-bold">Enrichment</h2>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Records Enriched</p>
                          <p className="text-3xl font-bold">{validationStats.usage_summary.enrichment_used || 0}</p>
                        </div>
                        <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-yellow-600" />
                        </div>
                      </div>

                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-600 rounded-full"
                          style={{
                            width: `${Math.min(((validationStats.usage_summary.enrichment_used || 0) / 50) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <UserCheck className="h-5 w-5 text-indigo-600 mr-2" />
                        <h2 className="text-lg font-bold">People Finder</h2>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">People Found</p>
                          <p className="text-3xl font-bold">{validationStats.company_people_finder_count || 0}</p>
                        </div>
                        <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-8 w-8 text-indigo-600" />
                        </div>
                      </div>

                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{
                            width: `${Math.min(((validationStats.company_people_finder_count || 0) / 50) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Usage Summary */}
                <Card className="shadow-md border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-6">
                      <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                      <h2 className="text-lg font-bold">Usage Summary</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Contact Upload</p>
                        <div className="flex items-end justify-between mt-2">
                          <p className="text-2xl font-bold">{validationStats.user_validation_count}</p>
                          <Upload className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Phone Validation</p>
                        <div className="flex items-end justify-between mt-2">
                          <p className="text-2xl font-bold">{validationStats.phone_validation_count || 0}</p>
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">LinkedIn Finder</p>
                        <div className="flex items-end justify-between mt-2">
                          <p className="text-2xl font-bold">{validationStats.usage_summary.linkedin_used || 0}</p>
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Contact Finder</p>
                        <div className="flex items-end justify-between mt-2">
                          <p className="text-2xl font-bold">{validationStats.usage_summary.contact_finder_used || 0}</p>
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Company Finder</p>
                        <div className="flex items-end justify-between mt-2">
                          <p className="text-2xl font-bold">{validationStats.company_finder_count || 0}</p>
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Email Validation</p>
                        <div className="flex items-end justify-between mt-2">
                          <p className="text-2xl font-bold">
                            {validationStats.usage_summary.email_validation_used || 0}
                          </p>
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">People Finder</p>
                        <div className="flex items-end justify-between mt-2">
                          <p className="text-2xl font-bold">
                            {validationStats.usage_summary.company_people_finder_used || 0}
                          </p>
                          <UserCheck className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                      <p>Data updated as of {new Date().toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Alert className="max-w-lg mx-auto">
                <AlertDescription>No data available.</AlertDescription>
              </Alert>
            )}
          </div>
        )

      case "credits":
        return (
          <div className="space-y-6">
            {/* Current Credits Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Credit Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-green-700">Credits Available</p>
                    <p className="text-3xl font-bold text-green-600">{getTotalAvailable().toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-700">Credits Used</p>
                    <p className="text-3xl font-bold text-blue-600">{getTotalUsage().toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-700">Total Credits</p>
                    <p className="text-3xl font-bold text-purple-600">{getTotalCredits().toLocaleString()}</p>
                  </div>
                </div>

                {/* Detailed Credit Breakdown */}
                {validationStats && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Credit Breakdown by Service</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Contact Upload</span>
                          <span className="text-sm">
                            {validationStats.available_credits.contact_finder} /{" "}
                            {validationStats.total_credits.contact_finder}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Phone Validation</span>
                          <span className="text-sm">
                            {validationStats.available_credits.phone_number_validation} /{" "}
                            {validationStats.total_credits.phone_number_validation}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">LinkedIn Finder</span>
                          <span className="text-sm">
                            {validationStats.available_credits.linkedin_finder} /{" "}
                            {validationStats.total_credits.linkedin_finder}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Contact Finder</span>
                          <span className="text-sm">
                            {validationStats.available_credits.contact_finder} /{" "}
                            {validationStats.total_credits.contact_finder}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Company Finder</span>
                          <span className="text-sm">
                            {validationStats.available_credits.company_finder} /{" "}
                            {validationStats.total_credits.company_finder}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Email Validation</span>
                          <span className="text-sm">
                            {validationStats.available_credits.email_validation} /{" "}
                            {validationStats.total_credits.email_validation}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Enrichment</span>
                          <span className="text-sm">
                            {validationStats.available_credits.enrichment} / {validationStats.total_credits.enrichment}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">People Finder</span>
                          <span className="text-sm">
                            {validationStats.available_credits.company_people_finder} /{" "}
                            {validationStats.total_credits.company_people_finder}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Credits */}
            <SimpleCreditPurchase />
          </div>
        )

      case "preferences":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications about your searches and account</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={userSettings.email_notifications}
                    onCheckedChange={(checked) => setUserSettings({ ...userSettings, email_notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Receive updates about new features and promotions</p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={userSettings.marketing_emails}
                    onCheckedChange={(checked) => setUserSettings({ ...userSettings, marketing_emails: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  General Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="auto-logout">Auto Logout (minutes)</Label>
                  <Input
                    id="auto-logout"
                    type="number"
                    value={userSettings.auto_logout_minutes}
                    onChange={(e) =>
                      setUserSettings({ ...userSettings, auto_logout_minutes: Number.parseInt(e.target.value) || 30 })
                    }
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">Automatically log out after period of inactivity</p>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={userSettings.timezone}
                    onChange={(e) => setUserSettings({ ...userSettings, timezone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account, view statistics, and configure preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">{renderTabContent()}</div>
      </div>
    </div>
  )
}
