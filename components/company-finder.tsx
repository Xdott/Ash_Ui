"use client"
import { useState } from "react"
import {
  Building2,
  ArrowLeft,
  Globe,
  ExternalLink,
  Users,
  DollarSign,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CompanyFinderForm } from "./company-finder-form"
import { useAuth0 } from "@auth0/auth0-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function CompanyFinder() {
  const [companyName, setCompanyName] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading } = useAuth0()

  const findCompany = async () => {
    if (!companyName) {
      toast({
        title: "Please enter a company name",
        variant: "destructive",
      })
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user?.email) {
      toast({
        title: "Authentication required",
        description: "Please log in to search for companies",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (!API_URL) {
        // Mock company data with REAL funding information
        setTimeout(() => {
          const mockResult = {
            display_name: companyName,
            name: companyName,
            industry: "Technology & Software",
            employee_count: 1250,
            location_name: "San Francisco, CA",
            location_country: "United States",
            website: "example.com",
            linkedin_url: "linkedin.com/company/example",
            facebook_url: "facebook.com/example",
            twitter_url: "twitter.com/example",
            total_funding_raised: 125000000, // $125M
            latest_funding_stage: "Series C",
            number_funding_rounds: 5,
            last_funding_date: "2023-08-15",
            year_founded: 2015,
            description: `${companyName} is a leading technology company focused on innovative solutions and digital transformation.`,
            user_email: user.email, // Add user email to mock result
          }
          console.log("Setting mock result with funding:", mockResult)
          setResult(mockResult)
          setLoading(false)
        }, 1500)
        return
      }

      // If API_URL is available, make the actual API call with user email
      console.log("🔍 Making API call with user email:", user.email)
      const res = await fetch(`${API_URL}/company-finder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          email: user.email, // Add user email to request body
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `API returned status ${res.status}`)
      }

      const data = await res.json()
      console.log("API result:", data)
      // Add user email to result for display
      setResult({
        ...data,
        user_email: user.email,
      })
    } catch (err) {
      console.error("Search failed:", err)
      setResult({
        error: err.message || "Company not found or server error.",
        user_email: user.email,
      })
    }

    setLoading(false)
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "social", label: "Social", icon: Globe },
    { id: "funding", label: "Funding", icon: DollarSign },
    { id: "info", label: "Info", icon: Users },
  ]

  const renderTabContent = () => {
    if (!result || result.error) return null

    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <Building2 className="h-4 w-4 text-purple-600 mr-2" />
                  <p className="text-sm font-semibold text-purple-700">Company Name</p>
                </div>
                <p className="text-base font-bold text-gray-900">{result.display_name || result.name || "N/A"}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 text-purple-600 mr-2" />
                  <p className="text-sm font-semibold text-purple-700">Industry</p>
                </div>
                <p className="text-base font-bold text-gray-900">{result.industry || "N/A"}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 text-purple-600 mr-2" />
                  <p className="text-sm font-semibold text-purple-700">Employee Count</p>
                </div>
                <p className="text-base font-bold text-gray-900">
                  {result.employee_count ? result.employee_count.toLocaleString() : "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 text-purple-600 mr-2" />
                  <p className="text-sm font-semibold text-purple-700">Location</p>
                </div>
                <p className="text-base font-bold text-gray-900">
                  {result.location_name || result.location_country || "N/A"}
                </p>
              </div>
            </div>

            {result.description && (
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <Building2 className="h-4 w-4 text-purple-600 mr-2" />
                  <p className="text-sm font-semibold text-purple-700">Description</p>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{result.description}</p>
              </div>
            )}
          </div>
        )

      case "social":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <Globe className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-sm font-semibold text-blue-700">Website</p>
                </div>
                {result.website ? (
                  <a
                    href={`https://${result.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center"
                  >
                    <Globe className="mr-1 h-4 w-4" />
                    {result.website}
                  </a>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <ExternalLink className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-sm font-semibold text-blue-700">LinkedIn</p>
                </div>
                {result.linkedin_url ? (
                  <a
                    href={`https://${result.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    View Profile
                  </a>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <ExternalLink className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-sm font-semibold text-blue-700">Facebook</p>
                </div>
                {result.facebook_url ? (
                  <a
                    href={`https://${result.facebook_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    View Page
                  </a>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <ExternalLink className="h-4 w-4 text-blue-600 mr-2" />
                  <p className="text-sm font-semibold text-blue-700">Twitter</p>
                </div>
                {result.twitter_url ? (
                  <a
                    href={`https://${result.twitter_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    View Profile
                  </a>
                ) : (
                  <p className="text-gray-500">N/A</p>
                )}
              </div>
            </div>
          </div>
        )

      case "funding":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                  <p className="text-sm font-semibold text-green-700">Total Funding Raised</p>
                </div>
                <p className="text-base font-bold text-gray-900">
                  {result.total_funding_raised ? `$${Number(result.total_funding_raised).toLocaleString()}` : "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                  <p className="text-sm font-semibold text-green-700">Funding Stage</p>
                </div>
                <p className="text-base font-bold text-gray-900">{result.latest_funding_stage || "N/A"}</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                  <p className="text-sm font-semibold text-green-700">Funding Rounds</p>
                </div>
                <p className="text-base font-bold text-gray-900">{result.number_funding_rounds || "N/A"}</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-green-600 mr-2" />
                  <p className="text-sm font-semibold text-green-700">Year Founded</p>
                </div>
                <p className="text-base font-bold text-gray-900">{result.year_founded || "N/A"}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-green-600 mr-2" />
                  <p className="text-sm font-semibold text-green-700">Last Funding Date</p>
                </div>
                <p className="text-base font-bold text-gray-900">
                  {result.last_funding_date ? new Date(result.last_funding_date).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )

      case "info":
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-purple-200">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="border border-purple-200 px-3 py-2 text-left font-semibold text-purple-800 text-sm">
                      Field
                    </th>
                    <th className="border border-purple-200 px-3 py-2 text-left font-semibold text-purple-800 text-sm">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-purple-200 px-3 py-2 font-medium text-sm">Name</td>
                    <td className="border border-purple-200 px-3 py-2 text-sm">
                      {result.display_name || result.name || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-purple-200 px-3 py-2 font-medium text-sm">Industry</td>
                    <td className="border border-purple-200 px-3 py-2 text-sm">{result.industry || "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="border border-purple-200 px-3 py-2 font-medium text-sm">Employee Count</td>
                    <td className="border border-purple-200 px-3 py-2 text-sm">
                      {result.employee_count ? result.employee_count.toLocaleString() : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-purple-200 px-3 py-2 font-medium text-sm">Location</td>
                    <td className="border border-purple-200 px-3 py-2 text-sm">
                      {result.location_name || result.location_country || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-purple-200 px-3 py-2 font-medium text-sm">Website</td>
                    <td className="border border-purple-200 px-3 py-2 text-sm">
                      {result.website ? (
                        <a
                          href={`https://${result.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline break-all"
                        >
                          {result.website}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-purple-200 px-3 py-2 font-medium text-sm">Total Funding</td>
                    <td className="border border-purple-200 px-3 py-2 text-sm">
                      {result.total_funding_raised ? `$${Number(result.total_funding_raised).toLocaleString()}` : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-purple-200 px-3 py-2 font-medium text-sm">Funding Stage</td>
                    <td className="border border-purple-200 px-3 py-2 text-sm">
                      {result.latest_funding_stage || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-purple-200 px-3 py-2 font-medium text-sm">Last Funding Date</td>
                    <td className="border border-purple-200 px-3 py-2 text-sm">
                      {result.last_funding_date ? new Date(result.last_funding_date).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-purple-200 px-3 py-2 font-medium text-sm">Year Founded</td>
                    <td className="border border-purple-200 px-3 py-2 text-sm">{result.year_founded || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Show loading while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth required message if not authenticated
  if (!isAuthenticated || !user?.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access the Company Finder.</p>
            <Link href="/">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800 hover:bg-purple-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          {/* User Info Display */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
            {user.picture && (
              <img
                src={user.picture || "/placeholder.svg"}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full"
              />
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg mb-4">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">🔍 Company Finder</h1>
            <p className="text-base text-gray-600">
              Discover comprehensive company information, funding details, and industry insights
            </p>
          </div>

          {/* Use the CompanyFinderForm component */}
          <CompanyFinderForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            onSubmit={findCompany}
            loading={loading}
          />

          {/* Results with Tabs */}
          {result && !result.error && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-purple-600">🏢 Company Details</h2>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                          activeTab === tab.id
                            ? "text-purple-600 bg-purple-50 border-b-2 border-purple-600"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">{renderTabContent()}</div>
              </CardContent>
            </Card>
          )}

          {/* Error Section */}
          {result?.error && (
            <Card className="shadow-xl border-0 bg-red-50/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="text-center text-red-700">{result.error}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
