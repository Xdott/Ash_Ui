"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import {
  Users,
  Building2,
  Search,
  Loader2,
  AlertCircle,
  Mail,
  Linkedin,
  ExternalLink,
  Download,
  Filter,
  CreditCard,
  User,
  Award,
  ChevronDown,
  Sparkles,
  Eye,
  UserCheck,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { EnrichmentTabs } from "@/components/enrichment-tabs"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface PersonResult {
  person_name: string
  title: string
  company_name: string
  company_domain?: string
  snippet: string
  linkedin_url?: string
  source_url: string
  match_score: number
  email?: string
  email_confidence?: number
  email_source?: string
  validation_score?: number
  enrichment_data?: any
  has_enrichment?: boolean
  enrichment_loading?: boolean
  added_to_contacts?: boolean
}

interface SearchResponse {
  results: PersonResult[]
  source: "cache" | "user_cache" | "api"
  credits_used: number
  remaining_credits: number
  company_name: string
  total_found: number
  message?: string
}

interface LinkedInEmailResponse {
  predicted_email?: string
  confidence?: number
  validation_score?: number
  source?: string
  credits_used: number
  remaining_credits: number
  error?: string
}

interface CompanySuggestion {
  company_name: string
  domain: string
}

interface EnrichmentResponse {
  success: boolean
  data?: any
  error?: string
  credits_used?: number
  remaining_credits?: number
}

export default function CompanyPeopleFinder() {
  const [companyName, setCompanyName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<PersonResult[]>([])
  const [searchInfo, setSearchInfo] = useState<Partial<SearchResponse> | null>(null)
  const [error, setError] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<CompanySuggestion[]>([])
  const [emailLoadingStates, setEmailLoadingStates] = useState<Record<number, boolean>>({})
  const [enrichmentLoadingStates, setEnrichmentLoadingStates] = useState<Record<number, boolean>>({})
  const [enrichmentModal, setEnrichmentModal] = useState<{
    open: boolean
    contact: any
    enrichedData: any
  }>({
    open: false,
    contact: null,
    enrichedData: null,
  })
  const { user } = useAuth0()
  const { toast } = useToast()
  const [hasSelectedSuggestion, setHasSelectedSuggestion] = useState(false)

  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Filter suggestions based on input using API
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (companyName.length >= 2 && !hasSelectedSuggestion) {
        try {
          const response = await fetch(`${API_URL}/company-suggestions?q=${encodeURIComponent(companyName)}`)
          if (response.ok) {
            const suggestions = await response.json()
            setFilteredSuggestions(suggestions)
            setShowSuggestions(suggestions.length > 0 && companyName.length < 20)
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setFilteredSuggestions([])
          setShowSuggestions(false)
        }
      } else {
        setFilteredSuggestions([])
        setShowSuggestions(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [companyName, hasSelectedSuggestion])

  // Handle click outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSuggestions])

  const handleSearch = async () => {
    if (!companyName.trim()) {
      setError("Company name is required")
      return
    }

    if (!user?.email) {
      setError("User authentication required")
      return
    }

    setIsLoading(true)
    setError("")
    setResults([])
    setSearchInfo(null)
    setShowSuggestions(false)

    try {
      const response = await fetch(`${API_URL}/company-people-finder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: companyName.trim(),
          email: user.email,
        }),
      })

      const data: SearchResponse = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          setError(`Insufficient credits. You need ${data.required_credits || 3} people finder credits.`)
          toast({
            title: "Insufficient Credits",
            description: "Please purchase more people finder credits to continue.",
            variant: "destructive",
          })
        } else {
          setError(data.error || "Search failed")
        }
        return
      }

      setResults(data.results || [])
      setSearchInfo(data)

      if (data.results && data.results.length > 0) {
        toast({
          title: "Search Successful!",
          description: `Found ${data.results.length} key people at ${data.company_name}${
            data.credits_used > 0 ? ` (${data.credits_used} credits used)` : " (cached result)"
          }`,
        })
      } else {
        toast({
          title: "No Results",
          description: data.message || "No senior people found for this company.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Network error occurred. Please try again.")
      toast({
        title: "Search Failed",
        description: "Network error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const enrichProfile = async (personIndex: number, linkedinUrl: string) => {
    if (!user?.email || !linkedinUrl) return

    setEnrichmentLoadingStates((prev) => ({ ...prev, [personIndex]: true }))

    // Update the person to show enrichment is loading
    setResults((prev) =>
      prev.map((person, index) => (index === personIndex ? { ...person, enrichment_loading: true } : person)),
    )

    try {
      const response = await fetch(`${API_URL}/api/enrich_profile?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkedin_url: linkedinUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          toast({
            title: "Insufficient Credits",
            description: "You need enrichment credits to get detailed profile data.",
            variant: "destructive",
          })
        } else {
          console.error("Enrichment failed:", data.error)
          toast({
            title: "Enrichment Failed",
            description: data.error || "Could not enrich this profile.",
            variant: "destructive",
          })
        }

        // Update to show no enrichment available
        setResults((prev) =>
          prev.map((person, index) =>
            index === personIndex ? { ...person, enrichment_loading: false, has_enrichment: false } : person,
          ),
        )
        return
      }

      // FIXED: Extract enrichment data correctly based on the actual API response structure
      let enrichmentData = null

      // Based on the console logs, the enrichment data is directly in the root object
      // Check if this looks like enrichment data by looking for common profile fields
      if (
        data &&
        typeof data === "object" &&
        (data.full_name ||
          data.first_name ||
          data.headline ||
          data.experiences ||
          data.education ||
          data.accomplishment_courses ||
          data.accomplishment_honors_awards)
      ) {
        // The entire response IS the enrichment data
        enrichmentData = data
      } else if (data.data && typeof data.data === "object") {
        // Fallback: check if there's a nested data property
        enrichmentData = data.data
      }

      if (enrichmentData && Object.keys(enrichmentData).length > 0) {
        // Update the results with enrichment data
        setResults((prev) =>
          prev.map((person, index) =>
            index === personIndex
              ? {
                  ...person,
                  enrichment_data: enrichmentData,
                  has_enrichment: true,
                  enrichment_loading: false,
                }
              : person,
          ),
        )

        toast({
          title: "Profile Enriched!",
          description: `Enhanced profile data available for ${results[personIndex]?.person_name}`,
        })
      } else {
        setResults((prev) =>
          prev.map((person, index) =>
            index === personIndex ? { ...person, enrichment_loading: false, has_enrichment: false } : person,
          ),
        )

        toast({
          title: "Enrichment Failed",
          description: "No enrichment data received from the API.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Enrichment error:", err)
      setResults((prev) =>
        prev.map((person, index) =>
          index === personIndex ? { ...person, enrichment_loading: false, has_enrichment: false } : person,
        ),
      )

      toast({
        title: "Enrichment Failed",
        description: "Network error occurred during enrichment.",
        variant: "destructive",
      })
    } finally {
      setEnrichmentLoadingStates((prev) => ({ ...prev, [personIndex]: false }))
    }
  }

  const findLinkedInEmail = async (personIndex: number, linkedinUrl: string) => {
    if (!user?.email || !linkedinUrl) return

    setEmailLoadingStates((prev) => ({ ...prev, [personIndex]: true }))

    try {
      const person = results[personIndex]

      const response = await fetch(`${API_URL}/linkedin-finder?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkedin_url: linkedinUrl,
          company_name: person.company_name,
        }),
      })

      const data: LinkedInEmailResponse = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          toast({
            title: "Insufficient Credits",
            description: "You need LinkedIn finder credits to get email addresses.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Email Search Failed",
            description: data.error || "Could not find email for this LinkedIn profile.",
            variant: "destructive",
          })
        }
        return
      }

      const predictedEmail = data.predicted_email

      if (predictedEmail) {
        setResults((prev) =>
          prev.map((person, index) =>
            index === personIndex
              ? {
                  ...person,
                  email: predictedEmail,
                  email_confidence: data.confidence,
                  email_source: data.source,
                  validation_score: data.validation_score,
                }
              : person,
          ),
        )

        const confidenceText = data.confidence ? ` (${data.confidence}% confidence)` : ""
        const validationText = data.validation_score ? ` - ${data.validation_score}% deliverable` : ""

        toast({
          title: "Email Found!",
          description: `Found email: ${predictedEmail}${confidenceText}${validationText} (${data.credits_used || 0} credits used)`,
        })
      } else {
        toast({
          title: "No Email Found",
          description: data.error || "Could not find an email for this LinkedIn profile.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("LinkedIn email search error:", err)
      toast({
        title: "Search Failed",
        description: "Network error occurred while searching for email.",
        variant: "destructive",
      })
    } finally {
      setEmailLoadingStates((prev) => ({ ...prev, [personIndex]: false }))
    }
  }

  const viewEnrichment = (person: PersonResult) => {
    if (!person.enrichment_data) {
      toast({
        title: "No Enrichment Data",
        description: "This profile hasn't been enriched yet. Click 'Enrich Profile' first.",
        variant: "destructive",
      })
      return
    }

    const contact = {
      first_name: person.person_name.split(" ")[0],
      last_name: person.person_name.split(" ").slice(1).join(" "),
      full_name: person.person_name,
      email: person.email,
      company: person.company_name,
      job_title: person.title,
      linkedin_url: person.linkedin_url,
    }

    setEnrichmentModal({
      open: true,
      contact: contact,
      enrichedData: person.enrichment_data,
    })
  }

  const addToContact = async (person: PersonResult, personIndex: number) => {
    if (!user?.email || !person.email) {
      toast({
        title: "Cannot Add Contact",
        description: "Email address is required to add contact.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`${API_URL}/add-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: user.email,
          first_name: person.person_name.split(" ")[0] || "",
          last_name: person.person_name.split(" ").slice(1).join(" ") || "",
          full_name: person.person_name,
          email: person.email,
          company: person.company_name,
          job_title: person.title,
          linkedin_url: person.linkedin_url || "",
          website: person.company_domain ? `https://${person.company_domain}` : "",
          lead_source: "Company People Finder",
          source: "people_finder",
          notes: `Found via Company People Finder. Match Score: ${person.match_score}. ${person.snippet}`,
          custom_field_1: person.email_confidence ? `Email Confidence: ${person.email_confidence}%` : "",
          custom_field_2: person.validation_score ? `Validation Score: ${person.validation_score}%` : "",
          custom_field_3: person.email_source || "",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          toast({
            title: "Contact Already Exists",
            description: "A contact with this email already exists in your database.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Failed to Add Contact",
            description: data.error || "Could not add contact to database.",
            variant: "destructive",
          })
        }
        return
      }

      toast({
        title: "Contact Added Successfully!",
        description: `${person.person_name} has been added to your contacts database.`,
      })

      // Optional: Mark this person as added to contacts in the UI
      setResults((prev) => prev.map((p, index) => (index === personIndex ? { ...p, added_to_contacts: true } : p)))
    } catch (err) {
      console.error("Add contact error:", err)
      toast({
        title: "Network Error",
        description: "Failed to add contact due to network error.",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch()
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setCompanyName(suggestion)
    setShowSuggestions(false)
    setHasSelectedSuggestion(true)
  }

  const exportResults = () => {
    if (results.length === 0) return

    const csvContent = [
      [
        "Name",
        "Title",
        "Company",
        "Company Domain",
        "Email",
        "Email Confidence",
        "Validation Score",
        "Email Source",
        "LinkedIn URL",
        "Match Score",
        "Has Enrichment",
        "Snippet",
      ].join(","),
      ...results.map((person) =>
        [
          person.person_name || "",
          person.title || "",
          person.company_name || "",
          person.company_domain || "",
          person.email || "",
          person.email_confidence || "",
          person.validation_score || "",
          person.email_source || "",
          person.linkedin_url || "",
          person.match_score || "",
          person.has_enrichment ? "Yes" : "No",
          person.snippet || "",
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${companyName.replace(/[^a-zA-Z0-9]/g, "_")}_people_finder.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "People data exported to CSV file.",
    })
  }

  const getRelevanceScore = (score: number) => {
    if (score >= 400) return { stars: 5, label: "★★★★★ Perfect" }
    if (score >= 300) return { stars: 4, label: "★★★★ Great" }
    if (score >= 200) return { stars: 3, label: "★★★ Good" }
    if (score >= 100) return { stars: 2, label: "★★ Fair" }
    return { stars: 1, label: "★ Basic" }
  }

  const getConfidenceLevel = (confidence?: number) => {
    if (!confidence) return { level: "Unknown", color: "bg-gray-100 text-gray-800" }
    if (confidence >= 80) return { level: "High", color: "bg-green-100 text-green-800" }
    if (confidence >= 60) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" }
    return { level: "Low", color: "bg-red-100 text-red-800" }
  }

  const getRelevanceColor = (stars: number) => {
    if (stars === 5) return "bg-purple-100 text-purple-800"
    if (stars === 4) return "bg-blue-100 text-blue-800"
    if (stars === 3) return "bg-green-100 text-green-800"
    if (stars === 2) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const getValidationColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800"
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    if (score >= 50) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Company People Finder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover key decision makers and senior professionals at any company with detailed enrichment
          </p>
        </div>

        {/* Search Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Find Company People
            </CardTitle>
            <CardDescription>
              Enter a company name to find senior executives, directors, and key decision makers with profile enrichment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                <Building2 className="h-4 w-4 mr-1" />
                Company Name *
              </label>
              <div className="relative">
                <Input
                  placeholder="e.g., Microsoft, Apple, Google"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value)
                    setHasSelectedSuggestion(false)
                  }}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(filteredSuggestions.length > 0 && !hasSelectedSuggestion)}
                  onBlur={(e) => {
                    // Don't hide suggestions immediately if clicking on a suggestion
                    setTimeout(() => {
                      if (!suggestionsRef.current?.contains(document.activeElement)) {
                        setShowSuggestions(false)
                      }
                    }, 150)
                  }}
                  className="h-12 text-lg pr-10 w-full"
                  disabled={isLoading}
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Company Suggestions Dropdown */}
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectSuggestion(suggestion.company_name)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="font-medium">{suggestion.company_name}</span>
                          <span className="text-xs text-gray-500">{suggestion.domain}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSearch}
                disabled={isLoading || !companyName.trim()}
                className="flex-1 h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Searching People...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Find People
                  </>
                )}
              </Button>

              {results.length > 0 && (
                <Button onClick={exportResults} variant="outline" className="h-12 px-6" disabled={isLoading}>
                  <Download className="h-5 w-5 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Info */}
        {searchInfo && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-semibold">{searchInfo.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">People Found</p>
                    <p className="font-semibold">{searchInfo.total_found || results.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Enriched</p>
                    <p className="font-semibold">{results.filter((r) => r.has_enrichment).length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Credits Used</p>
                    <p className="font-semibold">{searchInfo.credits_used || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Award className="h-6 w-6 mr-2 text-yellow-500" />
                Key People Found ({results.length})
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Sorted by relevance score</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((person, index) => {
                const relevance = getRelevanceScore(person.match_score)
                return (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg leading-tight">{person.person_name}</CardTitle>
                            <CardDescription className="text-sm">{person.title}</CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getRelevanceColor(relevance.stars)}>{relevance.label}</Badge>
                          {person.has_enrichment && (
                            <Badge className="bg-green-100 text-green-800">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Enriched
                            </Badge>
                          )}
                          {person.enrichment_loading && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Enriching...
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="h-4 w-4 mr-2" />
                          <div className="flex flex-col">
                            <span className="font-medium">{person.company_name}</span>
                            {person.company_domain && (
                              <span className="text-xs text-gray-500">{person.company_domain}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">{person.snippet}</div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {/* View Enriched Profile Button - Show when enriched */}
                        {person.has_enrichment && person.enrichment_data && (
                          <Button
                            onClick={() => viewEnrichment(person)}
                            size="sm"
                            className="w-full mb-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Enriched Profile
                          </Button>
                        )}

                        {/* Enrich Profile Button - Show when LinkedIn URL exists and not enriched */}
                        {person.linkedin_url && !person.has_enrichment && !person.enrichment_loading && (
                          <Button
                            onClick={() => enrichProfile(index, person.linkedin_url!)}
                            disabled={enrichmentLoadingStates[index]}
                            size="sm"
                            variant="outline"
                            className="w-full mb-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Enrich Profile (1 credit)
                          </Button>
                        )}

                        {/* LinkedIn Status */}
                        {person.linkedin_url ? (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <Linkedin className="h-4 w-4 mr-2" />
                              <span className="truncate">LinkedIn Profile</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(person.linkedin_url, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-gray-500">
                            <Globe className="h-4 w-4 mr-2" />
                            <span>LinkedIn URL not found - enrichment unavailable</span>
                          </div>
                        )}

                        {/* Email Display or Find Button */}
                        {person.email ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-gray-600">
                                <Mail className="h-4 w-4 mr-2" />
                                <span className="truncate">{person.email}</span>
                              </div>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Email Validation Badges */}
                            <div className="flex flex-wrap gap-1">
                              {person.email_confidence && (
                                <Badge className={`text-xs ${getConfidenceLevel(person.email_confidence).color}`}>
                                  {getConfidenceLevel(person.email_confidence).level} Confidence
                                </Badge>
                              )}
                              {person.validation_score && (
                                <Badge className={`text-xs ${getValidationColor(person.validation_score)}`}>
                                  {person.validation_score}% deliverable
                                </Badge>
                              )}
                            </div>

                            {/* Add to Contact Button - Only show when email exists */}
                            {!person.added_to_contacts ? (
                              <Button
                                onClick={() => addToContact(person, index)}
                                size="sm"
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Add to Contacts
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-green-500 text-green-600 cursor-default"
                                disabled
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Added to Contacts ✓
                              </Button>
                            )}
                          </div>
                        ) : person.linkedin_url ? (
                          <Button
                            onClick={() => findLinkedInEmail(index, person.linkedin_url!)}
                            disabled={emailLoadingStates[index]}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            {emailLoadingStates[index] ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Finding Email...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Find Email (1 credit)
                              </>
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && searchInfo && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No People Found</h3>
              <p className="text-gray-600 mb-4">We couldn't find any senior people for "{searchInfo.company_name}".</p>
              <p className="text-sm text-gray-500">
                Try searching with a different company name or check the spelling.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enrichment Modal */}
      {enrichmentModal.open && enrichmentModal.enrichedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {enrichmentModal.enrichedData?.full_name || enrichmentModal.contact?.full_name || "Contact"} - Profile
                  Details
                </h2>
                <button
                  onClick={() => setEnrichmentModal((prev) => ({ ...prev, open: false }))}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <EnrichmentTabs contact={enrichmentModal.contact} enrichedData={enrichmentModal.enrichedData} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
