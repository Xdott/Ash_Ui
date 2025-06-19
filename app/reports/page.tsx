"use client"

import { useState, useEffect } from "react"
import {
  Loader2,
  Download,
  Search,
  RefreshCw,
  Users,
  Building2,
  MapPin,
  Mail,
  Phone,
  Target,
  Briefcase,
  BarChart,
  AlertCircle,
  CheckCircle,
  UserCheck,
  TrendingUp,
  Shield,
  AlertTriangle,
  Star,
  Globe,
  Calendar,
  DollarSign,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ReportDashboard } from "@/components/report-dashboard"
import { toast } from "@/components/ui/use-toast"

// Replace with actual Auth0 hook:
import { useAuth0 } from "@auth0/auth0-react"

// API base URL - adjust this to match your Flask server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export default function AdvancedContactDashboard() {
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [tenantInfo, setTenantInfo] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [expandedCompany, setExpandedCompany] = useState(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  })

  // Add this state near the other useState declarations
  const [userSynced, setUserSynced] = useState(false)

  // Add these new state variables after the existing useState declarations
  const [reportResults, setReportResults] = useState([])
  const [currentReport, setCurrentReport] = useState(null)
  const [showReportResults, setShowReportResults] = useState(false)

  const { user, isAuthenticated, isLoading: authLoading } = useAuth0()

  // Update useEffect to be simpler
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setError("Please log in to view analytics")
      setLoading(false)
      return
    }

    // Only fetch data once when component mounts and user is authenticated
    if (!userSynced && !refreshing) {
      syncUserAndFetchData()
    }
  }, [authLoading, isAuthenticated])

  // Add a separate effect for time range changes
  useEffect(() => {
    if (userSynced && isAuthenticated && !authLoading) {
      // Only refetch data when time range changes, after user is already synced
      fetchData() // This won't call tenant info again
    }
  }, [selectedTimeRange])

  const syncUserAndFetchData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      // Step 1: Sync user and get tenant info in ONE call
      console.log("🔄 Syncing Auth0 user and getting tenant info...")
      const syncResult = await syncAuth0User()

      // Extract tenant info from sync result (now includes tenant_name from JOIN)
      if (syncResult.user_info) {
        const tenantData = {
          tenant_id: syncResult.user_info.tenant_id,
          tenant_name: syncResult.user_info.tenant_name,
          organization_name: syncResult.user_info.organization_name,
        }
        setTenantInfo(tenantData)
        console.log("✅ Tenant info received:", tenantData.tenant_name)
      }

      setUserSynced(true)
      console.log("✅ User synced successfully")

      // Step 2: Only fetch contacts and companies AFTER user sync is complete
      console.log("🔄 Fetching contacts and companies...")
      const [contactsData, companiesData] = await Promise.all([fetchContacts(1, searchTerm), fetchCompanies()])

      // Calculate stats from real data
      const calculatedStats = calculateAdvancedStats(
        contactsData,
        companiesData,
        syncResult.user_info?.tenant_name || "Unknown",
      )
      setStats(calculatedStats)

      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error("Error in sync and fetch:", err)
      setError(err.message)
      setLoading(false)
      setRefreshing(false)
    }
  }

  const syncAuth0User = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sync_auth0_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          name: user?.name,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to sync user: ${response.status}`)
      }

      const result = await response.json()

      return result
    } catch (err) {
      console.error("Error syncing Auth0 user:", err)
      throw err
    }
  }

  // Simplify fetchData to not call tenant info
  const fetchData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      // Just fetch contacts and companies - tenant info already available
      const [contactsData, companiesData] = await Promise.all([fetchContacts(1, searchTerm), fetchCompanies()])

      // Calculate stats from real data
      const calculatedStats = calculateAdvancedStats(contactsData, companiesData, tenantInfo?.tenant_name || "Unknown")
      setStats(calculatedStats)

      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.message)
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchContacts = async (page = 1, search = "") => {
    try {
      const params = new URLSearchParams({
        email: user?.email || "",
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) {
        params.append("search", search)
      }

      const url = `${API_BASE_URL}/api/contacts/with-enrichment?${params}`
      console.log("🔍 Fetching contacts from:", url)

      const response = await fetch(url)
      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)
        throw new Error(`Failed to fetch contacts: ${response.status}`)
      }
      const data = await response.json()
      setContacts(data.contacts || [])
      setPagination(data.pagination || pagination)
      return data.contacts || []
    } catch (err) {
      console.error("Error fetching contacts:", err)
      throw err
    }
  }

  const fetchCompanies = async () => {
    try {
      const url = `${API_BASE_URL}/api/contacts/companies?email=${encodeURIComponent(user?.email || "")}&limit=100`
      console.log("🔍 Fetching companies from:", url)

      const response = await fetch(url)
      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error response:", errorText)
        throw new Error(`Failed to fetch companies: ${response.status}`)
      }
      const data = await response.json()
      setCompanies(data.companies || [])
      return data.companies || []
    } catch (err) {
      console.error("Error fetching companies:", err)
      throw err
    }
  }

  const calculateAdvancedStats = (contactsList, companiesList, tenantName) => {
    const total = contactsList.length
    const totalCompanies = companiesList.length
    const withEmail = contactsList.filter((c) => c.email).length
    const withValidation = contactsList.filter((c) => c.is_validated).length
    const withEnrichment = contactsList.filter((c) => c.has_enrichment).length
    const highValue = contactsList.filter((c) => (c.validation_score || 0) >= 80).length
    const riskContacts = contactsList.filter((c) => c.validation_score === 0).length
    const validatedWithRisk = contactsList.filter((c) => c.is_validated && c.validation_score === 0).length

    // Company size distribution
    const companySize = {}
    companiesList.forEach((company) => {
      const size = company.size || "Unknown"
      companySize[size] = (companySize[size] || 0) + 1
    })

    // Revenue distribution
    const revenueRanges = {
      "< $5M": 0,
      "$5M - $25M": 0,
      "$25M - $100M": 0,
      "> $100M": 0,
    }
    companiesList.forEach((company) => {
      const revenue = company.annual_revenue || 0
      if (revenue < 5000000) revenueRanges["< $5M"]++
      else if (revenue < 25000000) revenueRanges["$5M - $25M"]++
      else if (revenue < 100000000) revenueRanges["$25M - $100M"]++
      else revenueRanges["> $100M"]++
    })

    // Lead score distribution (using validation_score as proxy)
    const leadScoreRanges = {
      "Low (0-40)": 0,
      "Medium (41-70)": 0,
      "High (71-100)": 0,
    }
    contactsList.forEach((contact) => {
      const score = contact.validation_score || 0
      if (score <= 40) leadScoreRanges["Low (0-40)"]++
      else if (score <= 70) leadScoreRanges["Medium (41-70)"]++
      else leadScoreRanges["High (71-100)"]++
    })

    // Validation score distribution
    const validationScores = {
      "Risk (0)": 0,
      "Low (1-50)": 0,
      "Medium (51-80)": 0,
      "High (81-100)": 0,
    }
    contactsList.forEach((contact) => {
      const score = contact.validation_score || 0
      if (score === 0) validationScores["Risk (0)"]++
      else if (score <= 50) validationScores["Low (1-50)"]++
      else if (score <= 80) validationScores["Medium (51-80)"]++
      else validationScores["High (81-100)"]++
    })

    // Technology adoption (from enriched data)
    const techStack = {}
    contactsList.forEach((contact) => {
      if (contact.enriched_raw_json) {
        try {
          const enrichedData =
            typeof contact.enriched_raw_json === "string"
              ? JSON.parse(contact.enriched_raw_json)
              : contact.enriched_raw_json

          // Extract technology info if available in enriched data
          if (enrichedData.technologies) {
            enrichedData.technologies.forEach((tech) => {
              techStack[tech] = (techStack[tech] || 0) + 1
            })
          }
        } catch (e) {
          // Skip if JSON parsing fails
        }
      }
    })

    // Geographic distribution
    const geoDistribution = {}
    contactsList.forEach((contact) => {
      const location = contact.enriched_country || contact.country || "Unknown"
      geoDistribution[location] = (geoDistribution[location] || 0) + 1
    })

    // Industry penetration
    const industryPenetration = {}
    contactsList.forEach((contact) => {
      const industry = contact.industry || "Unknown"
      industryPenetration[industry] = (industryPenetration[industry] || 0) + 1
    })

    // Mock monthly growth data (you can enhance this with real time-series data)
    const monthlyGrowth = [
      { month: "Jan", contacts: Math.floor(total * 0.1), companies: Math.floor(totalCompanies * 0.1) },
      { month: "Feb", contacts: Math.floor(total * 0.15), companies: Math.floor(totalCompanies * 0.15) },
      { month: "Mar", contacts: Math.floor(total * 0.2), companies: Math.floor(totalCompanies * 0.2) },
      { month: "Apr", contacts: Math.floor(total * 0.25), companies: Math.floor(totalCompanies * 0.25) },
      { month: "May", contacts: Math.floor(total * 0.3), companies: Math.floor(totalCompanies * 0.3) },
      { month: "Jun", contacts: total, companies: totalCompanies },
    ]

    // Calculate data quality score
    const emailCoverage = total > 0 ? (withEmail / total) * 100 : 0
    const validationRate = withEmail > 0 ? (withValidation / withEmail) * 100 : 0
    const enrichmentRate = total > 0 ? (withEnrichment / total) * 100 : 0
    const dataQualityScore = Math.round((emailCoverage + validationRate + enrichmentRate) / 3)

    return {
      total_contacts: total,
      total_companies: totalCompanies,
      contacts_with_email: withEmail,
      contacts_with_validation: withValidation,
      contacts_with_enrichment: withEnrichment,
      high_value_contacts: highValue,
      risk_contacts: riskContacts,
      validated_with_risk: validatedWithRisk,
      companies_by_size: companySize,
      companies_by_revenue: revenueRanges,
      contacts_by_lead_score: leadScoreRanges,
      validation_score_distribution: validationScores,
      technology_adoption: techStack,
      geographic_distribution: geoDistribution,
      industry_penetration: industryPenetration,
      monthly_growth: monthlyGrowth,
      engagement_metrics: {
        email_deliverability:
          withValidation > 0 ? (((withValidation - riskContacts) / withValidation) * 100).toFixed(1) : 0,
        response_rate: 18.3, // This would need to come from your email campaign data
        conversion_rate: 4.7, // This would need to come from your CRM data
      },
      data_quality_score: dataQualityScore,
      tenant_name: tenantName,
    }
  }

  const exportAdvancedReport = () => {
    const exportData = {
      tenant: tenantInfo?.tenant_name || "Unknown Organization",
      export_date: new Date().toISOString(),
      time_range: selectedTimeRange,
      summary: {
        total_contacts: stats.total_contacts,
        total_companies: stats.total_companies,
        high_value_contacts: stats.high_value_contacts,
        risk_contacts: stats.risk_contacts,
        data_quality_score: stats.data_quality_score,
      },
      advanced_analytics: stats,
      contact_details: contacts.map((contact) => ({
        ...contact,
        risk_level: contact.validation_score === 0 ? "HIGH" : contact.validation_score < 50 ? "MEDIUM" : "LOW",
      })),
      company_profiles: companies,
      generated_by: user?.email,
      report_type: "Advanced Contact & Company Analytics",
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `advanced_analytics_report_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSearch = async () => {
    try {
      setRefreshing(true)
      await fetchContacts(1, searchTerm)
      setRefreshing(false)
    } catch (err) {
      console.error("Search error:", err)
      setRefreshing(false)
    }
  }

  const getFilteredContacts = () => {
    let filtered = contacts

    if (filterBy !== "all") {
      switch (filterBy) {
        case "high_value":
          filtered = filtered.filter((c) => (c.validation_score || 0) >= 80)
          break
        case "risk":
          filtered = filtered.filter((c) => c.validation_score === 0)
          break
        case "enriched":
          filtered = filtered.filter((c) => c.has_enrichment)
          break
        case "validated":
          filtered = filtered.filter((c) => c.is_validated)
          break
      }
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "validation_score":
          return (b.validation_score || 0) - (a.validation_score || 0)
        case "company":
          return (a.company || "").localeCompare(b.company || "")
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }

  const getTopItems = (obj, limit = 5) => {
    return Object.entries(obj || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
  }

  const applyReportFilters = (contacts, filters) => {
    let filtered = [...contacts]

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((contact) =>
        filters.status.some((status) => contact.status?.toLowerCase().includes(status.toLowerCase())),
      )
    }

    // Apply source filter
    if (filters.source && filters.source.length > 0) {
      filtered = filtered.filter((contact) =>
        filters.source.some((source) => contact.source?.toLowerCase().includes(source.toLowerCase())),
      )
    }

    // Apply job title filter
    if (filters.jobTitle && filters.jobTitle.length > 0) {
      filtered = filtered.filter((contact) =>
        filters.jobTitle.some((title) =>
          (contact.job_title || contact.enriched_headline || "").toLowerCase().includes(title.toLowerCase()),
        ),
      )
    }

    // Apply company filter
    if (filters.company && filters.company.trim()) {
      filtered = filtered.filter((contact) =>
        (contact.company || "").toLowerCase().includes(filters.company.toLowerCase()),
      )
    }

    // Apply location filter
    if (filters.location && filters.location.trim()) {
      filtered = filtered.filter((contact) =>
        [contact.city, contact.enriched_city, contact.country, contact.enriched_country].some(
          (loc) => loc && loc.toLowerCase().includes(filters.location.toLowerCase()),
        ),
      )
    }

    // Apply validation status filter
    if (filters.validationStatus && filters.validationStatus !== "all") {
      switch (filters.validationStatus) {
        case "validated":
          filtered = filtered.filter((contact) => contact.is_validated)
          break
        case "unvalidated":
          filtered = filtered.filter((contact) => !contact.is_validated)
          break
        case "high-risk":
          filtered = filtered.filter((contact) => contact.validation_score === 0)
          break
      }
    }

    // Apply enrichment status filter
    if (filters.enrichmentStatus && filters.enrichmentStatus !== "all") {
      switch (filters.enrichmentStatus) {
        case "enriched":
          filtered = filtered.filter((contact) => contact.has_enrichment)
          break
        case "not-enriched":
          filtered = filtered.filter((contact) => !contact.has_enrichment)
          break
      }
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((contact) => contact.tags && filters.tags.some((tag) => contact.tags.includes(tag)))
    }

    return filtered
  }

  // Add function to generate CSV from contact data
  const generateContactCSV = (contacts, reportName) => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Job Title",
      "Location",
      "Validation Score",
      "Validation Status",
      "Enrichment Status",
      "Created Date",
      "Tags",
    ]

    const csvRows = contacts.map((contact) =>
      [
        contact.enriched_full_name ||
          contact.full_name ||
          `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
          "Unknown",
        contact.email || "",
        contact.phone || contact.mobile || "",
        contact.company || "",
        contact.enriched_headline || contact.job_title || "",
        [contact.enriched_city || contact.city, contact.enriched_country || contact.country].filter(Boolean).join(", "),
        contact.validation_score || 0,
        contact.is_validated ? "Validated" : "Not Validated",
        contact.has_enrichment ? "Enriched" : "Not Enriched",
        new Date(contact.created_at).toLocaleDateString(),
        (contact.tags || []).join("; "),
      ].map((field) =>
        typeof field === "string" && (field.includes(",") || field.includes('"'))
          ? `"${field.replace(/"/g, '""')}"`
          : field,
      ),
    )

    const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${reportName.replace(/\s+/g, "_").toLowerCase()}_results_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return csvContent
  }

  const handleRunReport = async (report) => {
    setLoading(true)
    try {
      // Apply the saved filters to current contacts
      const filteredContacts = applyReportFilters(contacts, report.filters)

      // Generate and download CSV
      generateContactCSV(filteredContacts, report.name)

      // Set report results for display
      setReportResults(filteredContacts)
      setCurrentReport(report)
      setShowReportResults(true)
      setActiveTab("report-results")

      toast({
        title: "Report Generated",
        description: `"${report.name}" executed successfully. ${filteredContacts.length} contacts found and CSV downloaded.`,
      })

      // Update last run time
      const updatedReports = JSON.parse(localStorage.getItem("savedSearches") || "[]")
      const newReports = updatedReports.map((r) =>
        r.id === report.id ? { ...r, lastRun: new Date().toISOString(), resultCount: filteredContacts.length } : r,
      )
      localStorage.setItem("savedSearches", JSON.stringify(newReports))
    } catch (error) {
      toast({
        title: "Report Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 text-lg">Loading advanced analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center py-20">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Required</h2>
              <p className="text-gray-600">Please log in to view analytics dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 p-3 rounded-full">
            <BarChart className="h-8 w-8 text-white" />
          </div>
          <div className="ml-4">
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics Dashboard</h1>
            <p className="text-gray-600">{tenantInfo?.tenant_name || "Loading..."} • Contact & Company Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={exportAdvancedReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "overview", label: "Overview", icon: BarChart },
          { id: "contacts", label: "Contact Intelligence", icon: Users },
          { id: "companies", label: "Company Profiles", icon: Building2 },
          { id: "analytics", label: "Advanced Analytics", icon: TrendingUp },
          { id: "saved-reports", label: "Saved Reports", icon: FileText },
          { id: "report-results", label: "Report Results", icon: FileText },
          { id: "quality", label: "Risk & Quality", icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Contacts</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.total_contacts}</p>
                    <p className="text-blue-700 text-xs">Across {stats.total_companies} companies</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">High Value Contacts</p>
                    <p className="text-3xl font-bold text-green-900">{stats.high_value_contacts}</p>
                    <p className="text-green-700 text-xs">Validation Score ≥ 80</p>
                  </div>
                  <Star className="h-12 w-12 text-green-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Risk Contacts</p>
                    <p className="text-3xl font-bold text-red-900">{stats.risk_contacts}</p>
                    <p className="text-red-700 text-xs">Validation Score = 0</p>
                  </div>
                  <AlertTriangle className="h-12 w-12 text-red-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Enriched Profiles</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.contacts_with_enrichment}</p>
                    <p className="text-purple-700 text-xs">
                      {stats.total_contacts > 0
                        ? Math.round((stats.contacts_with_enrichment / stats.total_contacts) * 100)
                        : 0}
                      % coverage
                    </p>
                  </div>
                  <UserCheck className="h-12 w-12 text-purple-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Data Quality Score</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.data_quality_score}%</p>
                    <Progress value={stats.data_quality_score} className="mt-2" />
                  </div>
                  <Award className="h-12 w-12 text-orange-600 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="font-semibold text-red-900">High Risk Emails</h3>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">{stats.risk_contacts}</p>
                  <p className="text-red-700 text-sm">Validation Score = 0</p>
                  <div className="mt-4">
                    <p className="text-xs text-red-600">
                      {stats.total_contacts > 0 ? Math.round((stats.risk_contacts / stats.total_contacts) * 100) : 0}%
                      of total contacts
                    </p>
                    <Progress
                      value={stats.total_contacts > 0 ? (stats.risk_contacts / stats.total_contacts) * 100 : 0}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-900">Validated with Risk</h3>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-yellow-600">{stats.validated_with_risk}</p>
                  <p className="text-yellow-700 text-sm">Validated but risky</p>
                  <div className="mt-4">
                    <p className="text-xs text-yellow-600">Requires immediate attention</p>
                    <Progress
                      value={
                        stats.contacts_with_validation > 0
                          ? (stats.validated_with_risk / stats.contacts_with_validation) * 100
                          : 0
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="font-semibold text-green-900">Quality Contacts</h3>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">
                    {stats.contacts_with_validation - stats.validated_with_risk}
                  </p>
                  <p className="text-green-700 text-sm">Safe & validated</p>
                  <div className="mt-4">
                    <p className="text-xs text-green-600">Ready for outreach</p>
                    <Progress
                      value={
                        stats.total_contacts > 0
                          ? ((stats.contacts_with_validation - stats.validated_with_risk) / stats.total_contacts) * 100
                          : 0
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Score Distribution */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold">Validation Score Distribution</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(stats.validation_score_distribution).map(([range, count]) => (
                  <div
                    key={range}
                    className={`p-4 rounded-lg border-2 ${
                      range.includes("Risk")
                        ? "bg-red-50 border-red-200"
                        : range.includes("Low")
                          ? "bg-yellow-50 border-yellow-200"
                          : range.includes("Medium")
                            ? "bg-blue-50 border-blue-200"
                            : "bg-green-50 border-green-200"
                    }`}
                  >
                    <div className="text-center">
                      <p
                        className={`text-2xl font-bold ${
                          range.includes("Risk")
                            ? "text-red-600"
                            : range.includes("Low")
                              ? "text-yellow-600"
                              : range.includes("Medium")
                                ? "text-blue-600"
                                : "text-green-600"
                        }`}
                      >
                        {count}
                      </p>
                      <p className="text-sm font-medium text-gray-700">{range}</p>
                      <p className="text-xs text-gray-500">
                        {stats.total_contacts > 0 ? Math.round((count / stats.total_contacts) * 100) : 0}% of total
                      </p>
                      <Progress
                        value={stats.total_contacts > 0 ? (count / stats.total_contacts) * 100 : 0}
                        className="mt-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="space-y-6">
          {/* Contact Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search contacts by name, email, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={refreshing} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="high_value">High Value (Score ≥ 80)</SelectItem>
                    <SelectItem value="risk">Risk Contacts (Score = 0)</SelectItem>
                    <SelectItem value="enriched">Enriched Profiles</SelectItem>
                    <SelectItem value="validated">Validated Emails</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Date Added</SelectItem>
                    <SelectItem value="validation_score">Validation Score</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contact List */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Contact Intelligence ({getFilteredContacts().length})</h2>
                {pagination.total_count > 0 && (
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total_count)} of {pagination.total_count}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {getFilteredContacts().map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {contact.enriched_full_name ||
                              contact.full_name ||
                              `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
                              "Unknown"}
                          </h3>
                          <div className="flex gap-2">
                            {(contact.validation_score || 0) >= 80 && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <Star className="h-3 w-3 mr-1" />
                                High Value
                              </Badge>
                            )}
                            {contact.validation_score === 0 && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Risk Email
                              </Badge>
                            )}
                            {contact.is_validated && contact.validation_score > 0 && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validated
                              </Badge>
                            )}
                            {contact.has_enrichment && (
                              <Badge variant="secondary">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Enriched
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                          {contact.email && (
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {contact.email}
                            </div>
                          )}
                          {(contact.phone || contact.mobile) && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {contact.phone || contact.mobile}
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex items-center text-gray-600">
                              <Building2 className="h-4 w-4 mr-2" />
                              {contact.company}
                            </div>
                          )}
                          {(contact.enriched_city || contact.city || contact.enriched_country || contact.country) && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {[contact.enriched_city || contact.city, contact.enriched_country || contact.country]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          {(contact.enriched_headline || contact.job_title) && (
                            <div className="flex items-center text-gray-600">
                              <Briefcase className="h-4 w-4 mr-2" />
                              {contact.enriched_headline || contact.job_title}
                            </div>
                          )}
                          {contact.validation_score !== undefined && contact.validation_score !== null && (
                            <div className="flex items-center">
                              <Shield
                                className={`h-4 w-4 mr-2 ${contact.validation_score === 0 ? "text-red-600" : "text-green-600"}`}
                              />
                              <span
                                className={`font-medium ${contact.validation_score === 0 ? "text-red-600" : "text-green-600"}`}
                              >
                                Validation: {contact.validation_score}
                              </span>
                            </div>
                          )}
                          {contact.validation_result && (
                            <div className="flex items-center text-gray-600">
                              <Target className="h-4 w-4 mr-2" />
                              <span className="text-sm">{contact.validation_result}</span>
                            </div>
                          )}
                        </div>

                        {contact.tags && contact.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {contact.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 text-right">
                        <div>Added: {new Date(contact.created_at).toLocaleDateString()}</div>
                        {contact.enrichment_accepted_at && (
                          <div className="mt-1">
                            Enriched: {new Date(contact.enrichment_accepted_at).toLocaleDateString()}
                          </div>
                        )}
                        {contact.validated_at && (
                          <div className="mt-1">Validated: {new Date(contact.validated_at).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {getFilteredContacts().length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Contacts Found</h3>
                  <p className="text-sm">
                    {searchTerm || filterBy !== "all"
                      ? "Try adjusting your search or filters."
                      : "No contacts have been added yet."}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => fetchContacts(pagination.page - 1, searchTerm)}
                    disabled={!pagination.has_prev || refreshing}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchContacts(pagination.page + 1, searchTerm)}
                    disabled={!pagination.has_next || refreshing}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "companies" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Company Profiles ({companies.length})</h2>
              </div>

              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{company.name}</h3>
                            <p className="text-gray-600">
                              {company.industry || "Unknown Industry"} • {company.size || "Unknown Size"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                          {company.headquarters && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {company.headquarters}
                            </div>
                          )}
                          {company.employee_count && (
                            <div className="flex items-center text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              {company.employee_count} employees
                            </div>
                          )}
                          {company.annual_revenue && (
                            <div className="flex items-center text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2" />${(company.annual_revenue / 1000000).toFixed(1)}M
                              revenue
                            </div>
                          )}
                          {company.founded_year && (
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              Founded {company.founded_year}
                            </div>
                          )}
                        </div>

                        {company.website && (
                          <div className="mb-3">
                            <div className="flex items-center text-gray-600">
                              <Globe className="h-4 w-4 mr-2" />
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {company.website}
                              </a>
                            </div>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
                        >
                          {expandedCompany === company.id ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              View Details
                            </>
                          )}
                        </Button>

                        {expandedCompany === company.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold mb-2">Company Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                {company.domain && (
                                  <p>
                                    <strong>Domain:</strong> {company.domain}
                                  </p>
                                )}
                                {company.description && (
                                  <p>
                                    <strong>Description:</strong> {company.description}
                                  </p>
                                )}
                              </div>
                              <div>
                                {company.phone && (
                                  <p>
                                    <strong>Phone:</strong> {company.phone}
                                  </p>
                                )}
                                {company.address && (
                                  <p>
                                    <strong>Address:</strong> {company.address}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 text-right">
                        <div>Added: {new Date(company.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {companies.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Companies Found</h3>
                  <p className="text-sm">No companies have been added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "analytics" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Size Distribution */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Building2 className="h-5 w-5 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold">Company Size Distribution</h2>
                </div>
                <div className="space-y-3">
                  {getTopItems(stats.companies_by_size).map(([size, count]) => (
                    <div key={size} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{size}</span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={stats.total_companies > 0 ? (count / stats.total_companies) * 100 : 0}
                          className="w-32"
                        />
                        <span className="font-semibold text-sm w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Distribution */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold">Revenue Distribution</h2>
                </div>
                <div className="space-y-3">
                  {getTopItems(stats.companies_by_revenue).map(([range, count]) => (
                    <div key={range} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{range}</span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={stats.total_companies > 0 ? (count / stats.total_companies) * 100 : 0}
                          className="w-32"
                        />
                        <span className="font-semibold text-sm w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technology Adoption */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className="h-5 w-5 text-purple-600 mr-2" />
                  <h2 className="text-lg font-semibold">Technology Adoption</h2>
                </div>
                <div className="space-y-3">
                  {getTopItems(stats.technology_adoption).length > 0 ? (
                    getTopItems(stats.technology_adoption).map(([tech, count]) => (
                      <div key={tech} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{tech}</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={stats.total_contacts > 0 ? (count / stats.total_contacts) * 100 : 0}
                            className="w-32"
                          />
                          <span className="font-semibold text-sm w-8">{count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No technology data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-red-600 mr-2" />
                  <h2 className="text-lg font-semibold">Geographic Distribution</h2>
                </div>
                <div className="space-y-3">
                  {getTopItems(stats.geographic_distribution).map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{location}</span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={stats.total_contacts > 0 ? (count / stats.total_contacts) * 100 : 0}
                          className="w-32"
                        />
                        <span className="font-semibold text-sm w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Trends */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold">Growth Trends (Estimated)</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {stats.monthly_growth.map((month) => (
                  <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">{month.month}</p>
                    <p className="text-xl font-bold text-blue-600">{month.contacts}</p>
                    <p className="text-xs text-gray-500">contacts</p>
                    <p className="text-lg font-semibold text-green-600">{month.companies}</p>
                    <p className="text-xs text-gray-500">companies</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saved Reports Tab - This is where we integrate the ReportDashboard */}
      {activeTab === "saved-reports" && (
        <div className="space-y-6">
          <ReportDashboard onRunReport={handleRunReport} />
        </div>
      )}

      {activeTab === "report-results" && (
        <div className="space-y-6">
          {currentReport && reportResults ? (
            <>
              {/* Report Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{currentReport.name}</h2>
                      <p className="text-gray-600">{currentReport.description || "No description provided"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => generateContactCSV(reportResults, currentReport.name)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab("saved-reports")}>
                        Back to Reports
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{reportResults.length}</div>
                      <div className="text-sm text-blue-600">Total Contacts</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {reportResults.filter((c) => c.is_validated).length}
                      </div>
                      <div className="text-sm text-green-600">Validated</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {reportResults.filter((c) => c.has_enrichment).length}
                      </div>
                      <div className="text-sm text-purple-600">Enriched</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {reportResults.filter((c) => c.validation_score === 0).length}
                      </div>
                      <div className="text-sm text-red-600">High Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Results Table */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Report Results</h3>
                    <p className="text-sm text-gray-500">
                      Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {reportResults.map((contact) => (
                      <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">
                                {contact.enriched_full_name ||
                                  contact.full_name ||
                                  `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
                                  "Unknown"}
                              </h4>
                              <div className="flex gap-2">
                                {(contact.validation_score || 0) >= 80 && (
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    High Value
                                  </Badge>
                                )}
                                {contact.validation_score === 0 && (
                                  <Badge variant="destructive">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Risk Email
                                  </Badge>
                                )}
                                {contact.is_validated && contact.validation_score > 0 && (
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Validated
                                  </Badge>
                                )}
                                {contact.has_enrichment && (
                                  <Badge variant="secondary">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Enriched
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                              {contact.email && (
                                <div className="flex items-center text-gray-600">
                                  <Mail className="h-4 w-4 mr-2" />
                                  {contact.email}
                                </div>
                              )}
                              {(contact.phone || contact.mobile) && (
                                <div className="flex items-center text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {contact.phone || contact.mobile}
                                </div>
                              )}
                              {contact.company && (
                                <div className="flex items-center text-gray-600">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  {contact.company}
                                </div>
                              )}
                              {(contact.enriched_city ||
                                contact.city ||
                                contact.enriched_country ||
                                contact.country) && (
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {[contact.enriched_city || contact.city, contact.enriched_country || contact.country]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                              {(contact.enriched_headline || contact.job_title) && (
                                <div className="flex items-center text-gray-600">
                                  <Briefcase className="h-4 w-4 mr-2" />
                                  {contact.enriched_headline || contact.job_title}
                                </div>
                              )}
                              {contact.validation_score !== undefined && contact.validation_score !== null && (
                                <div className="flex items-center">
                                  <Shield
                                    className={`h-4 w-4 mr-2 ${contact.validation_score === 0 ? "text-red-600" : "text-green-600"}`}
                                  />
                                  <span
                                    className={`font-medium ${contact.validation_score === 0 ? "text-red-600" : "text-green-600"}`}
                                  >
                                    Validation: {contact.validation_score}
                                  </span>
                                </div>
                              )}
                            </div>

                            {contact.tags && contact.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {contact.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-gray-500 text-right">
                            <div>Added: {new Date(contact.created_at).toLocaleDateString()}</div>
                            {contact.enrichment_accepted_at && (
                              <div className="mt-1">
                                Enriched: {new Date(contact.enrichment_accepted_at).toLocaleDateString()}
                              </div>
                            )}
                            {contact.validated_at && (
                              <div className="mt-1">
                                Validated: {new Date(contact.validated_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reportResults.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Contacts Found</h3>
                      <p className="text-sm">The applied filters didn't match any contacts.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Results</h3>
                <p className="text-gray-600 mb-4">Run a report from the Saved Reports tab to see results here.</p>
                <Button variant="outline" onClick={() => setActiveTab("saved-reports")}>
                  Go to Saved Reports
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "quality" && stats && (
        <div className="space-y-6">
          {/* Risk Assessment Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <Shield className="h-5 w-5 text-red-600 mr-2" />
                <h2 className="text-lg font-semibold">Risk Assessment & Action Items</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-red-600 mb-3">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Immediate Actions Required
                  </h3>
                  <div className="space-y-3">
                    {stats.risk_contacts > 0 && (
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-sm font-medium text-red-800">
                          Remove {stats.risk_contacts} high-risk email addresses
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          These contacts have validation score of 0 and could harm sender reputation
                        </p>
                      </div>
                    )}

                    {stats.validated_with_risk > 0 && (
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-800">
                          Review {stats.validated_with_risk} validated but risky contacts
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          These emails are technically valid but flagged for potential issues
                        </p>
                      </div>
                    )}

                    {stats.data_quality_score < 70 && (
                      <div className="p-3 bg-orange-50 rounded border border-orange-200">
                        <p className="text-sm font-medium text-orange-800">
                          Improve data quality score ({stats.data_quality_score}%)
                        </p>
                        <p className="text-xs text-orange-600 mt-1">Focus on email validation and profile enrichment</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-green-600 mb-3">
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Optimization Opportunities
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm font-medium text-green-800">
                        Enrich {stats.total_contacts - stats.contacts_with_enrichment} profiles
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Add LinkedIn profiles, job titles, and company information
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">
                        Validate {stats.contacts_with_email - stats.contacts_with_validation} emails
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Ensure deliverability for remaining email addresses</p>
                    </div>

                    <div className="p-3 bg-purple-50 rounded border border-purple-200">
                      <p className="text-sm font-medium text-purple-800">
                        Target {stats.high_value_contacts} high-value contacts
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Focus outreach efforts on contacts with validation scores ≥ 80
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Metrics */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <Award className="h-5 w-5 text-orange-600 mr-2" />
                <h2 className="text-lg font-semibold">Data Quality Analysis</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Quality Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Email Coverage</span>
                        <span className="text-sm">
                          {stats.total_contacts > 0
                            ? Math.round((stats.contacts_with_email / stats.total_contacts) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={stats.total_contacts > 0 ? (stats.contacts_with_email / stats.total_contacts) * 100 : 0}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Validation Rate</span>
                        <span className="text-sm">
                          {stats.contacts_with_email > 0
                            ? Math.round((stats.contacts_with_validation / stats.contacts_with_email) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          stats.contacts_with_email > 0
                            ? (stats.contacts_with_validation / stats.contacts_with_email) * 100
                            : 0
                        }
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Enrichment Rate</span>
                        <span className="text-sm">
                          {stats.total_contacts > 0
                            ? Math.round((stats.contacts_with_enrichment / stats.total_contacts) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          stats.total_contacts > 0 ? (stats.contacts_with_enrichment / stats.total_contacts) * 100 : 0
                        }
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Overall Data Quality</span>
                        <span className="text-sm font-bold">{stats.data_quality_score}%</span>
                      </div>
                      <Progress value={stats.data_quality_score} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Risk Assessment Summary</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">Critical Risk Emails</span>
                        <span className="text-lg font-bold text-red-600">{stats.risk_contacts}</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        These contacts have validation scores of 0 and should not be contacted
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-800">Validated Risk Emails</span>
                        <span className="text-lg font-bold text-yellow-600">{stats.validated_with_risk}</span>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        Technically validated but flagged as risky - use with caution
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Safe Contacts</span>
                        <span className="text-lg font-bold text-green-600">
                          {stats.contacts_with_validation - stats.validated_with_risk}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">Validated and safe for outreach campaigns</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Advanced Analytics Report generated on {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
            <p className="mt-1">
              {tenantInfo?.tenant_name || "Loading..."} • Time Range: {selectedTimeRange}
            </p>
            {user?.email && <p className="mt-1">Generated for: {user.email}</p>}
            <div className="mt-3 flex justify-center space-x-6 text-xs">
              <span>Total Contacts: {stats?.total_contacts || 0}</span>
              <span>Companies: {stats?.total_companies || 0}</span>
              <span>Data Quality: {stats?.data_quality_score || 0}%</span>
              <span>Risk Emails: {stats?.risk_contacts || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
