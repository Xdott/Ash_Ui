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
  Activity,
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
  Filter,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react"

// Self-contained UI components
const Button = ({ children, onClick, disabled = false, variant = "default", size = "default", className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`font-medium transition-colors ${
      size === "sm" 
        ? "px-3 py-1.5 text-sm rounded"
        : "px-4 py-2 rounded-md"
    } ${
      variant === "outline"
        ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        : variant === "destructive"
        ? "bg-red-600 text-white hover:bg-red-700"
        : variant === "secondary"
        ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
        : "bg-blue-600 text-white hover:bg-blue-700"
    } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
)

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
)

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
)

const Input = ({ placeholder, value, onChange, className = "" }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  />
)

const Select = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  >
    {children}
  </select>
)

const Alert = ({ children, className = "" }) => (
  <div className={`rounded-lg border p-4 bg-yellow-50 border-yellow-200 ${className}`}>{children}</div>
)

const AlertDescription = ({ children, className = "" }) => (
  <div className={`text-sm text-yellow-800 ${className}`}>{children}</div>
)

const Badge = ({ children, variant = "default", className = "" }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    variant === "success" ? "bg-green-100 text-green-800" :
    variant === "warning" ? "bg-yellow-100 text-yellow-800" :
    variant === "danger" ? "bg-red-100 text-red-800" :
    variant === "purple" ? "bg-purple-100 text-purple-800" :
    "bg-gray-100 text-gray-800"
  } ${className}`}>
    {children}
  </span>
)

const Progress = ({ value, max = 100, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
)

// Mock Auth0 hook
const useAuth0 = () => ({
  user: { email: "admin@techcorp.com", name: "Admin User" },
  isAuthenticated: true,
  isLoading: false,
})

export default function AdvancedContactDashboard() {
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
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
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0()

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setError("Please log in to view analytics")
      setLoading(false)
      return
    }
    fetchData()
  }, [authLoading, isAuthenticated, selectedTimeRange])

  const fetchData = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const mockData = getMockData()
      setContacts(mockData.contacts)
      setCompanies(mockData.companies)
      setStats(calculateAdvancedStats(mockData.contacts, mockData.companies))
      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.message)
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getMockData = () => ({
    contacts: [
      {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "john.doe@techcorp.com",
        phone: "+1-555-0123",
        company: "TechCorp",
        job_title: "VP Engineering",
        industry: "Technology",
        city: "San Francisco",
        country: "USA",
        has_enrichment: true,
        is_validated: true,
        validation_score: 95,
        validation_result: "valid",
        lead_score: 85,
        company_size: "500-1000",
        annual_revenue: 50000000,
        technology_stack: ["React", "Node.js", "AWS"],
        created_at: "2024-01-15T10:30:00Z",
        social_profiles: { linkedin: "johndoe", twitter: "johndoe" }
      },
      {
        id: "2",
        first_name: "Jane",
        last_name: "Smith",
        full_name: "Jane Smith",
        email: "jane.smith@innovate.com",
        company: "Innovate Inc",
        job_title: "Product Manager",
        industry: "Technology",
        city: "New York",
        country: "USA",
        has_enrichment: true,
        is_validated: true,
        validation_score: 0,
        validation_result: "risky",
        lead_score: 45,
        company_size: "100-500",
        annual_revenue: 15000000,
        technology_stack: ["Vue.js", "Python"],
        created_at: "2024-01-14T15:45:00Z"
      },
      {
        id: "3",
        first_name: "Mike",
        last_name: "Johnson",
        full_name: "Mike Johnson",
        email: "mike.j@healthcare.org",
        company: "HealthCare Solutions",
        job_title: "Director",
        industry: "Healthcare",
        city: "Chicago",
        country: "USA",
        has_enrichment: true,
        is_validated: true,
        validation_score: 88,
        validation_result: "valid",
        lead_score: 92,
        company_size: "1000+",
        annual_revenue: 100000000,
        created_at: "2024-01-13T09:15:00Z"
      },
      {
        id: "4",
        first_name: "Sarah",
        last_name: "Wilson",
        full_name: "Sarah Wilson",
        email: "sarah@startup.io",
        company: "StartupCo",
        job_title: "CEO",
        industry: "Technology",
        city: "Austin",
        country: "USA",
        has_enrichment: false,
        is_validated: true,
        validation_score: 0,
        validation_result: "invalid",
        lead_score: 30,
        company_size: "1-50",
        annual_revenue: 2000000,
        created_at: "2024-01-12T14:20:00Z"
      },
      {
        id: "5",
        first_name: "David",
        last_name: "Brown",
        full_name: "David Brown",
        email: "david.brown@finance.com",
        company: "Finance Corp",
        job_title: "CFO",
        industry: "Finance",
        city: "London",
        country: "UK",
        has_enrichment: true,
        is_validated: true,
        validation_score: 78,
        validation_result: "valid",
        lead_score: 88,
        company_size: "500-1000",
        annual_revenue: 75000000,
        created_at: "2024-01-11T11:30:00Z"
      }
    ],
    companies: [
      {
        id: "1",
        name: "TechCorp",
        domain: "techcorp.com",
        industry: "Technology",
        size: "500-1000",
        annual_revenue: 50000000,
        founded_year: 2015,
        headquarters: "San Francisco, CA",
        employee_count: 750,
        technology_stack: ["React", "Node.js", "AWS", "Docker"],
        contact_count: 1,
        enriched_contacts: 1,
        validated_contacts: 1,
        risk_contacts: 0,
        lead_score: 85,
        created_at: "2024-01-15T10:30:00Z"
      },
      {
        id: "2",
        name: "Innovate Inc",
        domain: "innovate.com",
        industry: "Technology",
        size: "100-500",
        annual_revenue: 15000000,
        founded_year: 2018,
        headquarters: "New York, NY",
        employee_count: 250,
        technology_stack: ["Vue.js", "Python", "GCP"],
        contact_count: 1,
        enriched_contacts: 1,
        validated_contacts: 1,
        risk_contacts: 1,
        lead_score: 45,
        created_at: "2024-01-14T15:45:00Z"
      },
      {
        id: "3",
        name: "HealthCare Solutions",
        domain: "healthcare.org",
        industry: "Healthcare",
        size: "1000+",
        annual_revenue: 100000000,
        founded_year: 2010,
        headquarters: "Chicago, IL",
        employee_count: 1500,
        contact_count: 1,
        enriched_contacts: 1,
        validated_contacts: 1,
        risk_contacts: 0,
        lead_score: 92,
        created_at: "2024-01-13T09:15:00Z"
      }
    ]
  })

  const calculateAdvancedStats = (contactsList, companiesList) => {
    const total = contactsList.length
    const totalCompanies = companiesList.length
    const withEmail = contactsList.filter(c => c.email).length
    const withValidation = contactsList.filter(c => c.is_validated).length
    const withEnrichment = contactsList.filter(c => c.has_enrichment).length
    const highValue = contactsList.filter(c => (c.lead_score || 0) >= 80).length
    const riskContacts = contactsList.filter(c => c.validation_score === 0).length
    const validatedWithRisk = contactsList.filter(c => c.is_validated && c.validation_score === 0).length

    // Company size distribution
    const companySize = {}
    companiesList.forEach(company => {
      const size = company.size || "Unknown"
      companySize[size] = (companySize[size] || 0) + 1
    })

    // Revenue distribution
    const revenueRanges = {
      "< $5M": 0,
      "$5M - $25M": 0,
      "$25M - $100M": 0,
      "> $100M": 0
    }
    companiesList.forEach(company => {
      const revenue = company.annual_revenue || 0
      if (revenue < 5000000) revenueRanges["< $5M"]++
      else if (revenue < 25000000) revenueRanges["$5M - $25M"]++
      else if (revenue < 100000000) revenueRanges["$25M - $100M"]++
      else revenueRanges["> $100M"]++
    })

    // Lead score distribution
    const leadScoreRanges = {
      "Low (0-40)": 0,
      "Medium (41-70)": 0,
      "High (71-100)": 0
    }
    contactsList.forEach(contact => {
      const score = contact.lead_score || 0
      if (score <= 40) leadScoreRanges["Low (0-40)"]++
      else if (score <= 70) leadScoreRanges["Medium (41-70)"]++
      else leadScoreRanges["High (71-100)"]++
    })

    // Validation score distribution
    const validationScores = {
      "Risk (0)": 0,
      "Low (1-50)": 0,
      "Medium (51-80)": 0,
      "High (81-100)": 0
    }
    contactsList.forEach(contact => {
      const score = contact.validation_score || 0
      if (score === 0) validationScores["Risk (0)"]++
      else if (score <= 50) validationScores["Low (1-50)"]++
      else if (score <= 80) validationScores["Medium (51-80)"]++
      else validationScores["High (81-100)"]++
    })

    // Technology adoption
    const techStack = {}
    contactsList.forEach(contact => {
      if (contact.technology_stack) {
        contact.technology_stack.forEach(tech => {
          techStack[tech] = (techStack[tech] || 0) + 1
        })
      }
    })

    // Geographic distribution
    const geoDistribution = {}
    contactsList.forEach(contact => {
      const location = contact.country || "Unknown"
      geoDistribution[location] = (geoDistribution[location] || 0) + 1
    })

    // Industry penetration
    const industryPenetration = {}
    contactsList.forEach(contact => {
      const industry = contact.industry || "Unknown"
      industryPenetration[industry] = (industryPenetration[industry] || 0) + 1
    })

    // Mock monthly growth data
    const monthlyGrowth = [
      { month: "Jan", contacts: 45, companies: 12 },
      { month: "Feb", contacts: 62, companies: 18 },
      { month: "Mar", contacts: 78, companies: 25 },
      { month: "Apr", contacts: 95, companies: 32 },
      { month: "May", contacts: 118, companies: 38 },
      { month: "Jun", contacts: 142, companies: 45 }
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
        email_deliverability: 92.5,
        response_rate: 18.3,
        conversion_rate: 4.7
      },
      data_quality_score: dataQualityScore
    }
  }

  const exportAdvancedReport = () => {
    const exportData = {
      tenant: "TechCorp Organization",
      export_date: new Date().toISOString(),
      time_range: selectedTimeRange,
      summary: {
        total_contacts: stats.total_contacts,
        total_companies: stats.total_companies,
        high_value_contacts: stats.high_value_contacts,
        risk_contacts: stats.risk_contacts,
        data_quality_score: stats.data_quality_score
      },
      advanced_analytics: stats,
      contact_details: contacts.map(contact => ({
        ...contact,
        risk_level: contact.validation_score === 0 ? "HIGH" : 
                   contact.validation_score < 50 ? "MEDIUM" : "LOW"
      })),
      company_profiles: companies,
      generated_by: user?.email,
      report_type: "Advanced Contact & Company Analytics"
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

  const getFilteredContacts = () => {
    let filtered = contacts

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        (contact.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.company || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterBy !== "all") {
      switch (filterBy) {
        case "high_value":
          filtered = filtered.filter(c => (c.lead_score || 0) >= 80)
          break
        case "risk":
          filtered = filtered.filter(c => c.validation_score === 0)
          break
        case "enriched":
          filtered = filtered.filter(c => c.has_enrichment)
          break
        case "validated":
          filtered = filtered.filter(c => c.is_validated)
          break
      }
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "lead_score":
          return (b.lead_score || 0) - (a.lead_score || 0)
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
            <p className="text-gray-600">TechCorp Organization • Contact & Company Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
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
          <AlertDescription>{error} - Showing demo data for preview.</AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "overview", label: "Overview", icon: BarChart },
          { id: "contacts", label: "Contact Intelligence", icon: Users },
          { id: "companies", label: "Company Profiles", icon: Building2 },
          { id: "analytics", label: "Advanced Analytics", icon: TrendingUp },
          { id: "reports", label: "Risk & Quality", icon: Shield },
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
              <CardContent>
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
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">High Value Contacts</p>
                    <p className="text-3xl font-bold text-green-900">{stats.high_value_contacts}</p>
                    <p className="text-green-700 text-xs">Lead Score ≥ 80</p>
                  </div>
                  <Star className="h-12 w-12 text-green-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent>
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
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Enriched Profiles</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.contacts_with_enrichment}</p>
                    <p className="text-purple-700 text-xs">{Math.round((stats.contacts_with_enrichment / stats.total_contacts) * 100)}% coverage</p>
                  </div>
                  <UserCheck className="h-12 w-12 text-purple-600 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent>
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
              <CardContent>
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="font-semibold text-red-900">High Risk Emails</h3>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">{stats.risk_contacts}</p>
                  <p className="text-red-700 text-sm">Validation Score = 0</p>
                  <div className="mt-4">
                    <p className="text-xs text-red-600">
                      {Math.round((stats.risk_contacts / stats.total_contacts) * 100)}% of total contacts
                    </p>
                    <Progress 
                      value={(stats.risk_contacts / stats.total_contacts) * 100} 
                      className="mt-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent>
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-900">Validated with Risk</h3>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-yellow-600">{stats.validated_with_risk}</p>
                  <p className="text-yellow-700 text-sm">Validated but risky</p>
                  <div className="mt-4">
                    <p className="text-xs text-yellow-600">
                      Requires immediate attention
                    </p>
                    <Progress 
                      value={(stats.validated_with_risk / stats.contacts_with_validation) * 100} 
                      className="mt-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent>
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
                    <p className="text-xs text-green-600">
                      Ready for outreach
                    </p>
                    <Progress 
                      value={((stats.contacts_with_validation - stats.validated_with_risk) / stats.total_contacts) * 100} 
                      className="mt-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Score Distribution */}
          <Card>
            <CardContent>
              <div className="flex items-center mb-6">
                <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold">Validation Score Distribution</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(stats.validation_score_distribution).map(([range, count]) => (
                  <div key={range} className={`p-4 rounded-lg border-2 ${
                    range.includes("Risk") ? "bg-red-50 border-red-200" :
                    range.includes("Low") ? "bg-yellow-50 border-yellow-200" :
                    range.includes("Medium") ? "bg-blue-50 border-blue-200" :
                    "bg-green-50 border-green-200"
                  }`}>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        range.includes("Risk") ? "text-red-600" :
                        range.includes("Low") ? "text-yellow-600" :
                        range.includes("Medium") ? "text-blue-600" :
                        "text-green-600"
                      }`}>
                        {count}
                      </p>
                      <p className="text-sm font-medium text-gray-700">{range}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round((count / stats.total_contacts) * 100)}% of total
                      </p>
                      <Progress 
                        value={(count / stats.total_contacts) * 100} 
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
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search contacts by name, email, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                  <option value="all">All Contacts</option>
                  <option value="high_value">High Value (Score ≥ 80)</option>
                  <option value="risk">Risk Contacts (Score = 0)</option>
                  <option value="enriched">Enriched Profiles</option>
                  <option value="validated">Validated Emails</option>
                </Select>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="created_at">Date Added</option>
                  <option value="lead_score">Lead Score</option>
                  <option value="validation_score">Validation Score</option>
                  <option value="company">Company</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contact List */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Contact Intelligence ({getFilteredContacts().length})</h2>
              </div>

              <div className="space-y-4">
                {getFilteredContacts().map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {contact.full_name || `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown"}
                          </h3>
                          <div className="flex gap-2">
                            {contact.lead_score >= 80 && (
                              <Badge variant="success">
                                <Star className="h-3 w-3 mr-1" />
                                High Value
                              </Badge>
                            )}
                            {contact.validation_score === 0 && (
                              <Badge variant="danger">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Risk Email
                              </Badge>
                            )}
                            {contact.is_validated && contact.validation_score > 0 && (
                              <Badge variant="success">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Validated
                              </Badge>
                            )}
                            {contact.has_enrichment && (
                              <Badge variant="purple">
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
                          {contact.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {contact.phone}
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex items-center text-gray-600">
                              <Building2 className="h-4 w-4 mr-2" />
                              {contact.company}
                            </div>
                          )}
                          {(contact.city || contact.country) && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {[contact.city, contact.country].filter(Boolean).join(", ")}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          {contact.job_title && (
                            <div className="flex items-center text-gray-600">
                              <Briefcase className="h-4 w-4 mr-2" />
                              {contact.job_title}
                            </div>
                          )}
                          {contact.lead_score !== undefined && (
                            <div className="flex items-center">
                              <Target className="h-4 w-4 mr-2 text-purple-600" />
                              <span className="text-purple-600 font-medium">Lead Score: {contact.lead_score}</span>
                            </div>
                          )}
                          {contact.validation_score !== undefined && (
                            <div className="flex items-center">
                              <Shield className={`h-4 w-4 mr-2 ${contact.validation_score === 0 ? 'text-red-600' : 'text-green-600'}`} />
                              <span className={`font-medium ${contact.validation_score === 0 ? 'text-red-600' : 'text-green-600'}`}>
                                Validation: {contact.validation_score}
                              </span>
                            </div>
                          )}
                        </div>

                        {contact.technology_stack && contact.technology_stack.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {contact.technology_stack.map((tech) => (
                              <span key={tech} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 text-right">
                        <div>Added: {new Date(contact.created_at).toLocaleDateString()}</div>
                        {contact.company_size && (
                          <div className="mt-1">Company: {contact.company_size}</div>
                        )}
                        {contact.annual_revenue && (
                          <div className="mt-1">Revenue: ${(contact.annual_revenue / 1000000).toFixed(1)}M</div>
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
                    {searchTerm || filterBy !== "all" ? "Try adjusting your search or filters." : "No contacts have been added yet."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "companies" && (
        <div className="space-y-6">
          <Card>
            <CardContent>
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
                            <p className="text-gray-600">{company.industry} • {company.size}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={company.lead_score >= 80 ? "success" : company.lead_score >= 60 ? "warning" : "default"}>
                              Score: {company.lead_score}
                            </Badge>
                            {company.risk_contacts > 0 && (
                              <Badge variant="danger">
                                {company.risk_contacts} Risk Contacts
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {company.headquarters}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {company.employee_count || "Unknown"} employees
                          </div>
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            ${(company.annual_revenue / 1000000).toFixed(1)}M revenue
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            Founded {company.founded_year}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{company.contact_count}</p>
                            <p className="text-xs text-blue-700">Total Contacts</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{company.validated_contacts}</p>
                            <p className="text-xs text-green-700">Validated</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{company.enriched_contacts}</p>
                            <p className="text-xs text-purple-700">Enriched</p>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{company.risk_contacts}</p>
                            <p className="text-xs text-red-700">Risk Emails</p>
                          </div>
                        </div>

                        {company.technology_stack && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Technology Stack:</p>
                            <div className="flex flex-wrap gap-1">
                              {company.technology_stack.map((tech) => (
                                <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
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
                            <h4 className="font-semibold mb-2">Company Analysis</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Domain:</strong> {company.domain}</p>
                                <p><strong>Size Category:</strong> {company.size}</p>
                                <p><strong>Lead Score:</strong> {company.lead_score}/100</p>
                              </div>
                              <div>
                                <p><strong>Contact Quality:</strong> {Math.round((company.validated_contacts / company.contact_count) * 100)}% validated</p>
                                <p><strong>Enrichment Rate:</strong> {Math.round((company.enriched_contacts / company.contact_count) * 100)}%</p>
                                <p><strong>Risk Assessment:</strong> {company.risk_contacts > 0 ? `${company.risk_contacts} high-risk emails` : "Low risk"}</p>
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
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "analytics" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Size Distribution */}
            <Card>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Building2 className="h-5 w-5 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold">Company Size Distribution</h2>
                </div>
                <div className="space-y-3">
                  {getTopItems(stats.companies_by_size).map(([size, count]) => (
                    <div key={size} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{size}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(count / stats.total_companies) * 100} className="w-32" />
                        <span className="font-semibold text-sm w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Distribution */}
            <Card>
              <CardContent>
                <div className="flex items-center mb-4">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold">Revenue Distribution</h2>
                </div>
                <div className="space-y-3">
                  {getTopItems(stats.companies_by_revenue).map(([range, count]) => (
                    <div key={range} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{range}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(count / stats.total_companies) * 100} className="w-32" />
                        <span className="font-semibold text-sm w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technology Adoption */}
            <Card>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Globe className="h-5 w-5 text-purple-600 mr-2" />
                  <h2 className="text-lg font-semibold">Technology Adoption</h2>
                </div>
                <div className="space-y-3">
                  {getTopItems(stats.technology_adoption).map(([tech, count]) => (
                    <div key={tech} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{tech}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(count / stats.total_contacts) * 100} className="w-32" />
                        <span className="font-semibold text-sm w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardContent>
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-red-600 mr-2" />
                  <h2 className="text-lg font-semibold">Geographic Distribution</h2>
                </div>
                <div className="space-y-3">
                  {getTopItems(stats.geographic_distribution).map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{location}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(count / stats.total_contacts) * 100} className="w-32" />
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
            <CardContent>
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold">Growth Trends (Last 6 Months)</h2>
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

      {activeTab === "reports" && stats && (
        <div className="space-y-6">
          {/* Risk Assessment Summary */}
          <Card>
            <CardContent>
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
                        <p className="text-xs text-orange-600 mt-1">
                          Focus on email validation and profile enrichment
                        </p>
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
                      <p className="text-xs text-blue-600 mt-1">
                        Ensure deliverability for remaining email addresses
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded border border-purple-200">
                      <p className="text-sm font-medium text-purple-800">
                        Target {stats.high_value_contacts} high-value contacts
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Focus outreach efforts on contacts with lead scores ≥ 80
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Metrics */}
          <Card>
            <CardContent>
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
                        <span className="text-sm">{Math.round((stats.contacts_with_email / stats.total_contacts) * 100)}%</span>
                      </div>
                      <Progress value={(stats.contacts_with_email / stats.total_contacts) * 100} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Validation Rate</span>
                        <span className="text-sm">{Math.round((stats.contacts_with_validation / stats.contacts_with_email) * 100)}%</span>
                      </div>
                      <Progress value={(stats.contacts_with_validation / stats.contacts_with_email) * 100} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Enrichment Rate</span>
                        <span className="text-sm">{Math.round((stats.contacts_with_enrichment / stats.total_contacts) * 100)}%</span>
                      </div>
                      <Progress value={(stats.contacts_with_enrichment / stats.total_contacts) * 100} />
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
                      <p className="text-xs text-green-600 mt-1">
                        Validated and safe for outreach campaigns
                      </p>
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
        <CardContent>
          <div className="text-center text-sm text-gray-500">
            <p>
              Advanced Analytics Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
            <p className="mt-1">TechCorp Organization • Time Range: {selectedTimeRange}</p>
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