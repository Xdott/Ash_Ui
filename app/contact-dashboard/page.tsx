"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Loader2,
  Download,
  Search,
  RefreshCw,
  Users,
  Shield,
  Check,
  X,
  Eye,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { EditContactDialog } from "@/components/edit-contact-dialog"
import ContactResult from "@/components/contact-result"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Contact {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  company?: string
  phone?: string
  mobile?: string
  job_title?: string
  department?: string
  city?: string
  state?: string
  country?: string
  website?: string
  linkedin_url?: string
  lead_status?: string
  lead_source?: string
  created_at?: string
  updated_at?: string
  owner_email?: string
  owner_username?: string
  validation_score?: number
  validation_result?: string
  validation_status?: string
  is_validated?: boolean
  validated_at?: string
  has_enrichment?: boolean
  enriched_profile_id?: string
  enriched_linkedin_url?: string
  enriched_full_name?: string
  enriched_headline?: string
  enriched_city?: string
  enriched_country?: string
  enriched_raw_json?: any
  s3_profile_pic_url?: string
  enrichment_accepted_at?: string
  enrichment_data?: {
    social_profiles?: any[]
    company_info?: any
    additional_emails?: string[]
    phone_numbers?: string[]
    job_history?: any[]
    education?: any[]
    profile_pic_url?: string
  }
}

interface PendingEnrichment {
  contactId: string
  contact: Contact
  enrichmentData: any
  linkedinUrl?: string
  canEnrich: boolean
  errorMessage?: string
}

export default function ContactDashboard() {
  // Core data states
  const [allContacts, setAllContacts] = useState<Contact[]>([]) // All contacts from API
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    company: "",
    jobTitle: "",
    location: "",
    leadStatus: "all",
    leadSource: "all",
    owner: "",
    validationStatus: "all",
  })
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(100)

  // UI states
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [validatingEmails, setValidatingEmails] = useState(false)
  const [validatingContactId, setValidatingContactId] = useState<string | null>(null)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [inlineEditingField, setInlineEditingField] = useState<{ contactId: string; field: string } | null>(null)
  const [inlineEditValue, setInlineEditValue] = useState<string>("")

  // Enrichment states
  const [enrichmentResults, setEnrichmentResults] = useState<Record<string, any>>({})
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false)
  const [selectedEnrichmentData, setSelectedEnrichmentData] = useState<any>(null)
  const [enrichingContactId, setEnrichingContactId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [pendingEnrichment, setPendingEnrichment] = useState<PendingEnrichment | null>(null)
  const [showEnrichmentApproval, setShowEnrichmentApproval] = useState(false)
  const [approvingEnrichment, setApprovingEnrichment] = useState(false)

  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  // Fast client-side filtering and search
  const filteredContacts = useMemo(() => {
    let filtered = [...allContacts]

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((contact) => {
        const searchableFields = [
          contact.email,
          contact.first_name,
          contact.last_name,
          contact.full_name,
          contact.company,
          contact.job_title,
          contact.enriched_full_name,
          contact.enriched_headline,
        ]
        return searchableFields.some((field) => field?.toLowerCase().includes(searchLower))
      })
    }

    // Apply advanced filters
    if (filters.company.trim()) {
      const companyLower = filters.company.toLowerCase().trim()
      filtered = filtered.filter((contact) => contact.company?.toLowerCase().includes(companyLower))
    }

    if (filters.jobTitle.trim()) {
      const titleLower = filters.jobTitle.toLowerCase().trim()
      filtered = filtered.filter((contact) => contact.job_title?.toLowerCase().includes(titleLower))
    }

    if (filters.location.trim()) {
      const locationLower = filters.location.toLowerCase().trim()
      filtered = filtered.filter((contact) => {
        const location = [contact.city, contact.state, contact.country].filter(Boolean).join(", ")
        return location.toLowerCase().includes(locationLower)
      })
    }

    if (filters.leadStatus !== "all") {
      filtered = filtered.filter((contact) => contact.lead_status === filters.leadStatus)
    }

    if (filters.leadSource !== "all") {
      filtered = filtered.filter((contact) => contact.lead_source === filters.leadSource)
    }

    if (filters.validationStatus !== "all") {
      switch (filters.validationStatus) {
        case "validated":
          filtered = filtered.filter((contact) => contact.is_validated)
          break
        case "not_validated":
          filtered = filtered.filter((contact) => !contact.is_validated)
          break
        case "high_score":
          filtered = filtered.filter((contact) => (contact.validation_score || 0) >= 80)
          break
        case "medium_score":
          filtered = filtered.filter(
            (contact) => (contact.validation_score || 0) >= 60 && (contact.validation_score || 0) < 80,
          )
          break
        case "low_score":
          filtered = filtered.filter((contact) => (contact.validation_score || 0) < 60)
          break
      }
    }

    return filtered
  }, [allContacts, searchTerm, filters])

  // Paginated contacts
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredContacts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredContacts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)

  useEffect(() => {
    setMounted(true)
  }, [])

// NEW: Added second useEffect for immediate loading
useEffect(() => {
  if (user?.email && mounted) {
    // Start loading even before auth is fully complete
    fetchAllContacts()
  }
}, [user?.email, mounted])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filters])

  const fetchAllContacts = async () => {
    if (!user?.email) return

    setInitialLoading(true)

    try {
      console.log("🔄 Fetching all contacts...")

      const params = new URLSearchParams({
        email: user.email,
        page: "1",
        limit: "10000", // Fetch all contacts at once for client-side filtering
      })

      const endpoint = `${API_BASE_URL}/api/contacts/with-enrichment?${params.toString()}`
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()

        if (result.contacts && Array.isArray(result.contacts)) {
          const transformedContacts = result.contacts.map((contact: any) => ({
            id: contact.id?.toString() || `contact-${Math.random()}`,
            email: contact.email || "",
            first_name: contact.first_name || "",
            last_name: contact.last_name || "",
            full_name: contact.full_name || "",
            company: contact.company || "",
            phone: contact.phone || "",
            mobile: contact.mobile || "",
            job_title: contact.job_title || "",
            department: contact.department || "",
            city: contact.city || "",
            state: contact.state || "",
            country: contact.country || "",
            website: contact.website || "",
            linkedin_url: contact.linkedin_url || "",
            lead_status: contact.lead_status || "new",
            lead_source: contact.lead_source || "import",
            created_at: contact.created_at || "",
            updated_at: contact.updated_at || "",
            owner_email: contact.owner_email || "",
            owner_username: contact.owner_username || "",
            validation_score: contact.validation_score || null,
            validation_result: contact.validation_result || null,
            validation_status: contact.validation_status || null,
            is_validated: contact.is_validated || false,
            validated_at: contact.validated_at || null,
            has_enrichment: contact.has_enrichment || false,
            enriched_profile_id: contact.enriched_profile_id || null,
            enriched_linkedin_url: contact.enriched_linkedin_url || null,
            enriched_full_name: contact.enriched_full_name || null,
            enriched_headline: contact.enriched_headline || null,
            enriched_city: contact.enriched_city || null,
            enriched_country: contact.enriched_country || null,
            enriched_raw_json: contact.enriched_raw_json || null,
            s3_profile_pic_url: contact.s3_profile_pic_url || null,
            enrichment_accepted_at: contact.enrichment_accepted_at || null,
            enrichment_data: (() => {
              try {
                if (!contact.enriched_raw_json) return null
                if (typeof contact.enriched_raw_json === "object") {
                  return contact.enriched_raw_json
                }
                if (typeof contact.enriched_raw_json === "string") {
                  if (contact.enriched_raw_json.startsWith("[object Object]")) {
                    return null
                  }
                  return JSON.parse(contact.enriched_raw_json)
                }
                return null
              } catch (error) {
                return null
              }
            })(),
          }))

          setAllContacts(transformedContacts)
          console.log(`✅ Loaded ${transformedContacts.length} contacts for client-side filtering`)
        }
      } else {
        // Fallback to basic contacts endpoint
        const fallbackEndpoint = `${API_BASE_URL}/api/contacts/contacts?${params.toString()}`
        const fallbackResponse = await fetch(fallbackEndpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (fallbackResponse.ok) {
          const result = await fallbackResponse.json()
          if (result.contacts && Array.isArray(result.contacts)) {
            const transformedContacts = result.contacts.map((contact: any) => ({
              id: contact.id?.toString() || `contact-${Math.random()}`,
              email: contact.email || "",
              first_name: contact.first_name || "",
              last_name: contact.last_name || "",
              full_name: contact.full_name || "",
              company: contact.company || "",
              phone: contact.phone || "",
              mobile: contact.mobile || "",
              job_title: contact.job_title || "",
              department: contact.department || "",
              city: contact.city || "",
              state: contact.state || "",
              country: contact.country || "",
              website: contact.website || "",
              linkedin_url: contact.linkedin_url || "",
              lead_status: contact.lead_status || "new",
              lead_source: contact.lead_source || "import",
              created_at: contact.created_at || "",
              updated_at: contact.updated_at || "",
              owner_email: contact.owner_email || "",
              owner_username: contact.owner_username || "",
              validation_score: contact.validation_score || null,
              validation_result: contact.validation_result || null,
              validation_status: contact.validation_status || null,
              is_validated: contact.is_validated || false,
              validated_at: contact.validated_at || null,
              has_enrichment: false,
              enrichment_data: null,
            }))

            setAllContacts(transformedContacts)
          }
        }
      }
    } catch (error) {
      console.error("❌ Error fetching contacts:", error)
      toast({
        title: "Connection Error",
        description: "Failed to load contacts. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setFilters({
      company: "",
      jobTitle: "",
      location: "",
      leadStatus: "all",
      leadSource: "all",
      owner: "",
      validationStatus: "all",
    })
    setCurrentPage(1)
  }

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }))
  }

  const getActiveFilterCount = () => {
    const searchCount = searchTerm ? 1 : 0
    const filterCount = Object.values(filters).filter((value) => value !== "" && value !== "all").length
    return searchCount + filterCount
  }

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts)
    if (checked) {
      newSelected.add(contactId)
    } else {
      newSelected.delete(contactId)
    }
    setSelectedContacts(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(paginatedContacts.map((c) => c.id)))
    } else {
      setSelectedContacts(new Set())
    }
  }

  const validateEmails = async () => {
    if (selectedContacts.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one contact to validate",
        variant: "destructive",
      })
      return
    }

    const selectedContactsList = Array.from(selectedContacts)
      .map((id) => allContacts.find((c) => c.id === id))
      .filter(Boolean) as Contact[]

    const contactsWithEmails = selectedContactsList.filter((contact) => contact.email && contact.email.trim() !== "")

    if (contactsWithEmails.length === 0) {
      toast({
        title: "No Emails",
        description: "Selected contacts don't have valid email addresses",
        variant: "destructive",
      })
      return
    }

    setValidatingEmails(true)

    try {
      const endpoint = `${API_BASE_URL}/api/email-validation/validate-bulk?email=${encodeURIComponent(user?.email || "")}`

      const requestBody = {
        validate_all: false,
        contact_ids: contactsWithEmails.map((c) => c.id),
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Bulk validation failed`)
      }

      const result = await response.json()

      toast({
        title: "Validation Complete",
        description: `Successfully processed ${result.summary?.total_processed || 0} contacts. ${result.summary?.successful_validations || 0} successful validations.`,
      })

      setSelectedContacts(new Set())
      await fetchAllContacts() // Refresh data
    } catch (error) {
      console.error("Validation error:", error)
      toast({
        title: "Validation Error",
        description: `Failed to validate emails: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setValidatingEmails(false)
    }
  }

  const validateSingleEmail = async (contactId: string, email: string): Promise<boolean> => {
    if (!email || email.trim() === "") {
      toast({
        title: "No Email",
        description: "This contact doesn't have an email address to validate",
        variant: "destructive",
      })
      return false
    }

    setValidatingContactId(contactId)
    try {
      const endpoint = `${API_BASE_URL}/api/email-validation/validate-single?email=${encodeURIComponent(user?.email || "")}`

      const requestBody = {
        contact_id: contactId,
        email: email.trim(),
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Validation failed`)
      }

      const result = await response.json()

      // Update contact in local state
      setAllContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === contactId
            ? {
                ...contact,
                validation_score: result.validation_score,
                validation_result: result.validation_result,
                validation_status: result.validation_status,
                is_validated: true,
                validated_at: new Date().toISOString(),
              }
            : contact,
        ),
      )

      return true
    } catch (error) {
      console.error(`Error validating email ${email}:`, error)
      toast({
        title: "Validation Failed",
        description: `Failed to validate ${email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      return false
    } finally {
      setValidatingContactId(null)
    }
  }

  const enrichSingleContact = async (contactId: string, email: string): Promise<boolean> => {
    if (!email || email.trim() === "") {
      toast({
        title: "No Email",
        description: "This contact doesn't have an email address to enrich",
        variant: "destructive",
      })
      return false
    }

    const contact = allContacts.find((c) => c.id === contactId)
    if (!contact) {
      toast({
        title: "Contact Not Found",
        description: "Could not find contact details",
        variant: "destructive",
      })
      return false
    }

    setEnrichingContactId(contactId)

    try {
      let enrichmentData = null
      let linkedinProfile = contact.linkedin_url
      let canEnrich = false
      let errorMessage = ""

      if (contact.linkedin_url && contact.linkedin_url.trim() !== "") {
        const endpoint = `${API_BASE_URL}/api/enrich_profile?email=${encodeURIComponent(user?.email || "")}`

        const requestBody = {
          linkedin_url: contact.linkedin_url.trim(),
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: LinkedIn enrichment failed`)
        }

        const result = await response.json()
        enrichmentData = result
        canEnrich = true
      } else {
        const contactName = contact.full_name || `${contact.first_name || ""} ${contact.last_name || ""}`.trim()

        if (!contactName || !contact.company) {
          errorMessage = "Missing contact name or company information required for LinkedIn lookup"
          canEnrich = false
        } else {
          const finderEndpoint = `${API_BASE_URL}/validate_employee?email=${encodeURIComponent(user?.email || "")}`

          const finderRequestBody = {
            employee_name: contactName,
            company_name: contact.company,
            title: contact.job_title || "",
            location: [contact.city, contact.state, contact.country].filter(Boolean).join(", ") || "",
            email: email.trim(),
          }

          const finderResponse = await fetch(finderEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(finderRequestBody),
          })

          if (!finderResponse.ok) {
            errorMessage = "No LinkedIn profile found for this contact"
            canEnrich = false
          } else {
            const finderResult = await finderResponse.json()
            linkedinProfile = finderResult.person_info?.linkedin_profile

            if (!linkedinProfile || linkedinProfile === "N/A") {
              errorMessage = "No LinkedIn profile found for this contact"
              canEnrich = false
            } else {
              const endpoint = `${API_BASE_URL}/api/enrich_profile?email=${encodeURIComponent(user?.email || "")}`

              const requestBody = {
                linkedin_url: linkedinProfile.trim(),
              }

              const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              })

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `HTTP ${response.status}: LinkedIn enrichment failed`)
              }

              const result = await response.json()
              enrichmentData = result
              canEnrich = true
            }
          }
        }
      }

      setPendingEnrichment({
        contactId,
        contact,
        enrichmentData,
        linkedinUrl: linkedinProfile,
        canEnrich,
        errorMessage,
      })
      setShowEnrichmentApproval(true)

      return true
    } catch (error) {
      console.error(`Error enriching contact ${email}:`, error)
      toast({
        title: "Enrichment Failed",
        description: `Failed to enrich ${email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      return false
    } finally {
      setEnrichingContactId(null)
    }
  }

  const approveEnrichment = async () => {
    if (!pendingEnrichment || !pendingEnrichment.canEnrich) return

    setApprovingEnrichment(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contacts/accept-enrichment?email=${encodeURIComponent(user?.email || "")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contact_id: pendingEnrichment.contactId,
            linkedin_url: pendingEnrichment.linkedinUrl,
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to accept enrichment")
      }

      const result = await response.json()

      // Update contact in local state
      setAllContacts((prevContacts) =>
        prevContacts.map((c) =>
          c.id === pendingEnrichment.contactId
            ? {
                ...c,
                has_enrichment: true,
                enriched_profile_id: result.enriched_profile_id,
                enriched_linkedin_url: pendingEnrichment.linkedinUrl,
                enrichment_accepted_at: new Date().toISOString(),
                linkedin_url: pendingEnrichment.linkedinUrl || c.linkedin_url,
                enrichment_data: pendingEnrichment.enrichmentData,
              }
            : c,
        ),
      )

      setEnrichmentResults((prev) => ({
        ...prev,
        [pendingEnrichment.contactId]: pendingEnrichment.enrichmentData,
      }))

      toast({
        title: "Enrichment Approved",
        description: "Contact enrichment has been successfully saved.",
      })

      setShowEnrichmentApproval(false)
      setPendingEnrichment(null)
    } catch (error) {
      console.error("Error accepting enrichment:", error)
      toast({
        title: "Save Failed",
        description: `Failed to save enrichment: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setApprovingEnrichment(false)
    }
  }

  const rejectEnrichment = () => {
    setShowEnrichmentApproval(false)
    setPendingEnrichment(null)
  }

  const viewEnrichmentData = (contact: Contact) => {
    setSelectedEnrichmentData({
      contact,
      enrichmentData: contact.enrichment_data || enrichmentResults[contact.id],
    })
    setShowEnrichmentModal(true)
  }

  const getValidationBadge = (contact: Contact) => {
    if (!contact.is_validated) {
      return (
        <Badge variant="outline" className="text-xs">
          Not Validated
        </Badge>
      )
    }

    const score = contact.validation_score

    if (score === null || score === undefined) {
      return (
        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
          No Score
        </Badge>
      )
    }

    if (score >= 80) {
      return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">High ({score})</Badge>
    } else if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Medium ({score})</Badge>
    } else if (score > 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Low ({score})</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Score: 0</Badge>
    }
  }

  const getValidationIcon = (contact: Contact) => {
    if (!contact.is_validated) {
      return <Shield className="h-4 w-4 text-gray-400" />
    }

    const score = contact.validation_score || 0

    if (score >= 80) {
      return <Shield className="h-4 w-4 text-green-500" />
    } else if (score >= 60) {
      return <Shield className="h-4 w-4 text-yellow-500" />
    } else if (score > 0) {
      return <Shield className="h-4 w-4 text-red-500" />
    } else {
      return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getEnrichmentBadge = (contact: Contact) => {
    if (!contact.has_enrichment) {
      return (
        <Badge variant="outline" className="text-xs">
          Not Enriched
        </Badge>
      )
    }

    return <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">Enriched</Badge>
  }

  const downloadContacts = () => {
    if (filteredContacts.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to download",
        variant: "destructive",
      })
      return
    }

    try {
      const headers = [
        "id",
        "email",
        "first_name",
        "last_name",
        "full_name",
        "company",
        "phone",
        "mobile",
        "job_title",
        "department",
        "city",
        "state",
        "country",
        "website",
        "linkedin_url",
        "lead_status",
        "lead_source",
        "created_at",
        "updated_at",
        "owner_email",
        "validation_score",
        "validation_result",
        "is_validated",
        "has_enrichment",
        "enrichment_data",
        "enrichment_accepted_at",
      ]

      let contactsToExport = filteredContacts

      if (selectedContacts.size > 0) {
        contactsToExport = filteredContacts.filter((contact) => selectedContacts.has(contact.id))
      }

      const enrichedContactsCount = contactsToExport.filter((c) => c.has_enrichment).length

      const csvHeaders = headers.join(",")
      const csvRows = contactsToExport.map((contact) =>
        headers
          .map((header) => {
            let value = contact[header as keyof Contact] || ""

            if (header === "enrichment_data" && contact.enrichment_data) {
              value = JSON.stringify(contact.enrichment_data)
            }

            return typeof value === "string" && (value.includes(",") || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value
          })
          .join(","),
      )

      const csvContent = [csvHeaders, ...csvRows].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `contacts_${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast({
        title: "Download Complete",
        description: `Downloaded ${contactsToExport.length} contacts (${enrichedContactsCount} enriched)`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate CSV file",
        variant: "destructive",
      })
    }
  }

  const goToPage = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    if (page !== currentPage) {
      setCurrentPage(page)
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">First Page</span>
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Previous Page</span>
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>

          {startPage > 1 && (
            <>
              <Button variant="outline" size="sm" onClick={() => goToPage(1)} className="h-8 w-8 p-0">
                1
              </Button>
              {startPage > 2 && <span className="mx-1">...</span>}
            </>
          )}

          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="mx-1">...</span>}
              <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)} className="h-8 w-8 p-0">
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Next Page</span>
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Last Page</span>
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Showing {paginatedContacts.length} of {filteredContacts.length} contacts
        </div>
      </div>
    )
  }

  const updateContact = async (updatedContact: Contact): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: updatedContact,
          email: user?.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update contact")
      }

      setAllContacts((prevContacts) =>
        prevContacts.map((contact) => (contact.id === updatedContact.id ? updatedContact : contact)),
      )

      toast({
        title: "Contact Updated",
        description: "Contact information has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating contact:", error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update contact",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setIsEditDialogOpen(true)
  }

  const startInlineEdit = (contactId: string, field: string, currentValue: string) => {
    setInlineEditingField({ contactId, field })
    setInlineEditValue(currentValue || "")
  }

  const cancelInlineEdit = () => {
    setInlineEditingField(null)
    setInlineEditValue("")
  }

  const saveInlineEdit = async (contactId: string, field: string, value: string) => {
    const contactToUpdate = allContacts.find((c) => c.id === contactId)
    if (!contactToUpdate) return

    const updatedContact = { ...contactToUpdate, [field]: value }

    try {
      await updateContact(updatedContact)
      setInlineEditingField(null)
    } catch (error) {
      // Error is already handled in updateContact
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and validate your contact database
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                  {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? "s" : ""} active
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Total:</span> {filteredContacts.length}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Selected:</span> {selectedContacts.size}
            </div>
            <Button
              variant="outline"
              onClick={fetchAllContacts}
              disabled={loading || initialLoading}
              size="sm"
              className="ml-2"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contacts by name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`${showAdvancedSearch ? "bg-blue-50 border-blue-200" : ""}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={validateEmails}
                  disabled={selectedContacts.size === 0 || validatingEmails}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {validatingEmails ? "Validating..." : `Validate (${selectedContacts.size})`}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Validate selected contacts' email addresses</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadContacts}>Export All Contacts</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadContacts} disabled={selectedContacts.size === 0}>
                Export Selected ({selectedContacts.size})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedSearch && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
              <Input
                placeholder="Filter by company"
                value={filters.company}
                onChange={(e) => handleFilterChange("company", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
              <Input
                placeholder="Filter by job title"
                value={filters.jobTitle}
                onChange={(e) => handleFilterChange("jobTitle", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <Input
                placeholder="Filter by location"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lead Status</label>
              <Select value={filters.leadStatus} onValueChange={(value) => handleFilterChange("leadStatus", value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
              <Select value={filters.leadSource} onValueChange={(value) => handleFilterChange("leadSource", value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Validation Status</label>
              <Select
                value={filters.validationStatus}
                onValueChange={(value) => handleFilterChange("validationStatus", value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All validation statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All validation statuses</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="not_validated">Not Validated</SelectItem>
                  <SelectItem value="high_score">High Score (80+)</SelectItem>
                  <SelectItem value="medium_score">Medium Score (60-79)</SelectItem>
                  <SelectItem value="low_score">&lt;60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={getActiveFilterCount() === 0}
              className="text-sm"
            >
              Clear all filters
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full rounded-none border-0 shadow-none">
          <CardContent className="p-0 h-full flex flex-col">
            {initialLoading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600" />
                  <p className="text-sm text-gray-600">Loading contacts...</p>
                </div>
              </div>
            ) : paginatedContacts.length === 0 ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center max-w-md">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || getActiveFilterCount() > 0 ? "No contacts match your search" : "No contacts found"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || getActiveFilterCount() > 0 ? (
                      <>
                        Try adjusting your search terms or filters, or{" "}
                        <button onClick={clearAllFilters} className="text-blue-600 hover:text-blue-800 underline">
                          clear all filters
                        </button>
                      </>
                    ) : (
                      <>Start by uploading contact data or check your database connection</>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={
                            paginatedContacts.length > 0 &&
                            paginatedContacts.every((contact) => selectedContacts.has(contact.id))
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[250px]">Contact Info</TableHead>
                      <TableHead className="w-[200px]">Company & Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email Validation</TableHead>
                      <TableHead>Enrichment</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedContacts.map((contact, index) => (
                      <TableRow
                        key={contact.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedContacts.has(contact.id)}
                            onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {(contact.first_name?.[0] || "") + (contact.last_name?.[0] || "")}
                              </div>

                              {(contact.enrichment_data?.profile_pic_url || contact.s3_profile_pic_url) && (
                                <img
                                  src={
                                    contact.s3_profile_pic_url ||
                                    contact.enrichment_data?.profile_pic_url ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                  alt=""
                                  className="absolute inset-0 w-8 h-8 rounded-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                  }}
                                />
                              )}
                            </div>

                            <div>
                              <div className="font-medium text-sm">
                                {inlineEditingField?.contactId === contact.id &&
                                inlineEditingField.field === "full_name" ? (
                                  <Input
                                    value={inlineEditValue}
                                    onChange={(e) => setInlineEditValue(e.target.value)}
                                    className="h-6 py-0 px-1 text-xs"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        saveInlineEdit(contact.id, "full_name", inlineEditValue)
                                      } else if (e.key === "Escape") {
                                        cancelInlineEdit()
                                      }
                                    }}
                                    onBlur={() => cancelInlineEdit()}
                                  />
                                ) : (
                                  <div
                                    className="cursor-pointer hover:text-blue-600"
                                    onClick={() =>
                                      startInlineEdit(
                                        contact.id,
                                        "full_name",
                                        contact.full_name ||
                                          `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
                                          "",
                                      )
                                    }
                                  >
                                    {contact.full_name ||
                                      `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
                                      "—"}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                {inlineEditingField?.contactId === contact.id &&
                                inlineEditingField.field === "email" ? (
                                  <Input
                                    value={inlineEditValue}
                                    onChange={(e) => setInlineEditValue(e.target.value)}
                                    className="h-6 py-0 px-1 text-xs"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        saveInlineEdit(contact.id, "email", inlineEditValue)
                                      } else if (e.key === "Escape") {
                                        cancelInlineEdit()
                                      }
                                    }}
                                    onBlur={() => cancelInlineEdit()}
                                  />
                                ) : (
                                  <>
                                    <span
                                      className="cursor-pointer hover:underline truncate max-w-[180px]"
                                      onClick={() => startInlineEdit(contact.id, "email", contact.email || "")}
                                      title={contact.email || ""}
                                    >
                                      {contact.email || "—"}
                                    </span>
                                    {getValidationIcon(contact)}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {inlineEditingField?.contactId === contact.id &&
                              inlineEditingField.field === "company" ? (
                                <Input
                                  value={inlineEditValue}
                                  onChange={(e) => setInlineEditValue(e.target.value)}
                                  className="h-6 py-0 px-1 text-xs"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      saveInlineEdit(contact.id, "company", inlineEditValue)
                                    } else if (e.key === "Escape") {
                                      cancelInlineEdit()
                                    }
                                  }}
                                  onBlur={() => cancelInlineEdit()}
                                />
                              ) : (
                                <div
                                  className="cursor-pointer hover:text-blue-600 truncate max-w-[180px]"
                                  onClick={() => startInlineEdit(contact.id, "company", contact.company || "")}
                                  title={contact.company || ""}
                                >
                                  {contact.company || "—"}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {inlineEditingField?.contactId === contact.id &&
                              inlineEditingField.field === "job_title" ? (
                                <Input
                                  value={inlineEditValue}
                                  onChange={(e) => setInlineEditValue(e.target.value)}
                                  className="h-6 py-0 px-1 text-xs"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      saveInlineEdit(contact.id, "job_title", inlineEditValue)
                                    } else if (e.key === "Escape") {
                                      cancelInlineEdit()
                                    }
                                  }}
                                  onBlur={() => cancelInlineEdit()}
                                />
                              ) : (
                                <div
                                  className="cursor-pointer hover:text-blue-600 truncate max-w-[180px]"
                                  onClick={() => startInlineEdit(contact.id, "job_title", contact.job_title || "")}
                                  title={contact.job_title || ""}
                                >
                                  {contact.job_title || "—"}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {inlineEditingField?.contactId === contact.id && inlineEditingField.field === "phone" ? (
                            <Input
                              value={inlineEditValue}
                              onChange={(e) => setInlineEditValue(e.target.value)}
                              className="h-6 py-0 px-1 text-xs"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  saveInlineEdit(contact.id, "phone", inlineEditValue)
                                } else if (e.key === "Escape") {
                                  cancelInlineEdit()
                                }
                              }}
                              onBlur={() => cancelInlineEdit()}
                            />
                          ) : (
                            <div
                              className="text-sm cursor-pointer hover:text-blue-600"
                              onClick={() =>
                                startInlineEdit(contact.id, "phone", contact.phone || contact.mobile || "")
                              }
                            >
                              {contact.phone || contact.mobile || "—"}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {[contact.city, contact.state, contact.country].filter(Boolean).join(", ") || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant={
                                contact.lead_status === "qualified"
                                  ? "default"
                                  : contact.lead_status === "contacted"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="capitalize text-xs"
                            >
                              {contact.lead_status || "new"}
                            </Badge>
                            <div className="text-xs text-gray-500 capitalize">{contact.lead_source || "unknown"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getValidationBadge(contact)}
                            {contact.validated_at && (
                              <div className="text-xs text-gray-400">
                                {new Date(contact.validated_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getEnrichmentBadge(contact)}
                            {contact.enrichment_accepted_at && (
                              <div className="text-xs text-gray-400">
                                {new Date(contact.enrichment_accepted_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => validateSingleEmail(contact.id, contact.email || "")}
                                    disabled={
                                      !contact.email ||
                                      contact.email.trim() === "" ||
                                      validatingContactId === contact.id ||
                                      validatingEmails
                                    }
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                  >
                                    {validatingContactId === contact.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Shield className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Validate email</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => enrichSingleContact(contact.id, contact.email || "")}
                                    disabled={
                                      !contact.email || contact.email.trim() === "" || enrichingContactId === contact.id
                                    }
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-purple-600"
                                  >
                                    {enrichingContactId === contact.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Users className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Enrich contact</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {contact.has_enrichment && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => viewEnrichmentData(contact)}
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-purple-600"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View enrichment data</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                                  <Edit className="h-3.5 w-3.5 mr-2" />
                                  Edit Contact
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete Contact
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!initialLoading && paginatedContacts.length > 0 && (
              <div className="bg-white border-t border-gray-200 p-4">{renderPagination()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Contact Dialog */}
      <EditContactDialog
        contact={editingContact}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={updateContact}
      />

      {/* Enrichment Modal */}
      <ContactResult
        open={showEnrichmentModal}
        onOpenChange={setShowEnrichmentModal}
        contact={selectedEnrichmentData?.contact}
        enrichedData={selectedEnrichmentData?.enrichmentData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Enrichment Approval Dialog */}
      <Dialog open={showEnrichmentApproval} onOpenChange={setShowEnrichmentApproval}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Review Enrichment Data
            </DialogTitle>
            <DialogDescription>
              {pendingEnrichment?.canEnrich
                ? "Please review the enrichment data below and decide whether to accept or reject it."
                : "This contact cannot be enriched because no LinkedIn profile was found."}
            </DialogDescription>
          </DialogHeader>

          {pendingEnrichment && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-base font-medium mb-3">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900">
                        {pendingEnrichment.contact.full_name ||
                          `${pendingEnrichment.contact.first_name || ""} ${pendingEnrichment.contact.last_name || ""}`.trim() ||
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{pendingEnrichment.contact.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company</p>
                      <p className="text-sm text-gray-900">{pendingEnrichment.contact.company || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Job Title</p>
                      <p className="text-sm text-gray-900">{pendingEnrichment.contact.job_title || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {pendingEnrichment.canEnrich ? (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-base font-medium mb-3">Enrichment Data Preview</h3>
                      <ContactResult
                        open={true}
                        onOpenChange={() => {}}
                        contact={pendingEnrichment.contact}
                        enrichedData={pendingEnrichment.enrichmentData}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isApprovalMode={true}
                        onApprove={approveEnrichment}
                        onReject={rejectEnrichment}
                        approving={approvingEnrichment}
                      />
                    </CardContent>
                  </Card>

                  {pendingEnrichment.linkedinUrl && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="text-base font-medium mb-3">LinkedIn Profile</h3>
                        <p className="text-sm text-gray-600">
                          {pendingEnrichment.contact.linkedin_url
                            ? "Used existing LinkedIn URL:"
                            : "Found LinkedIn URL via contact finder:"}
                        </p>
                        <a
                          href={pendingEnrichment.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          {pendingEnrichment.linkedinUrl}
                        </a>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-base font-medium text-red-600 mb-3">Cannot Enrich Contact</h3>
                    <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                      <X className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-red-800">No LinkedIn Profile Found</p>
                        <p className="text-sm text-red-600">
                          {pendingEnrichment.errorMessage ||
                            "This contact cannot be enriched because no LinkedIn profile was found."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={rejectEnrichment}
              disabled={approvingEnrichment}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              {pendingEnrichment?.canEnrich ? "Reject" : "Close"}
            </Button>
            {pendingEnrichment?.canEnrich && (
              <Button
                onClick={approveEnrichment}
                disabled={approvingEnrichment}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {approvingEnrichment ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {approvingEnrichment ? "Saving..." : "Accept & Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
