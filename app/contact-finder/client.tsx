"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { User, Building, MapPin, Briefcase, Search, Loader2, ArrowLeft, ExternalLink, Globe, Mail } from "lucide-react"
import { useAuth0 } from "@auth0/auth0-react"
import debounce from "lodash.debounce"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Contact Result Component
interface ContactResultProps {
  result: any
  enrichedData: any
  aiSummary: string
  onEnrichProfile: () => void
  onGenerateAISummary: () => void
  error: string | null
  employeeName: string
  loading: boolean
  enriching: boolean
  generating: boolean
  activeTab: string
  setActiveTab: (tab: string) => void
}

function ContactResult({
  result,
  enrichedData,
  aiSummary,
  onEnrichProfile,
  onGenerateAISummary,
  error,
  employeeName,
  loading,
  enriching,
  generating,
  activeTab,
  setActiveTab,
}: ContactResultProps) {
  const { user } = useAuth0()
  const [addedToContacts, setAddedToContacts] = useState(false)
  const [addingToContacts, setAddingToContacts] = useState(false)

  if (loading) {
    return (
      <div className="bg-blue-50 backdrop-blur shadow-xl rounded-xl border-0">
        <div className="p-8 text-center">
          <div className="text-blue-600 mb-4">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Searching for Contact...</h3>
            <p>This may take a few minutes. Please wait while we search our databases.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 backdrop-blur shadow-xl rounded-xl border-0">
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <h3 className="text-xl font-semibold mb-2">Search Failed</h3>
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 border-2 border-red-200 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-gray-50 backdrop-blur shadow-xl rounded-xl border-0">
        <div className="p-8 text-center">
          <div className="text-gray-600 mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Ready to Search</h3>
            <p>
              Enter contact details or LinkedIn URL to find professional information. Use enrichment for detailed
              insights.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Helper function to process skills data
  const processSkills = (skills: any) => {
    if (!skills) return []

    // Handle different skill data formats
    if (Array.isArray(skills)) {
      return skills
        .map((skill) => {
          if (typeof skill === "string") return skill
          if (typeof skill === "object" && skill.name) return skill.name
          if (typeof skill === "object" && skill.skill) return skill.skill
          return String(skill)
        })
        .filter(Boolean)
    }

    // Handle comma-separated string
    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }

    return []
  }

  const skillsList = processSkills(enrichedData?.skills)

  const addToContact = async () => {
    if (!user?.email || !result?.predicted_email) return

    setAddingToContacts(true)

    try {
      const contactData = {
        user_email: user.email,
        first_name: employeeName.split(" ")[0] || "",
        last_name: employeeName.split(" ").slice(1).join(" ") || "",
        full_name: enrichedData?.full_name || employeeName || "",
        email: result.predicted_email,
        company: result.domain || "",
        job_title: enrichedData?.headline || result.person_info?.title || "",
        linkedin_url:
          enrichedData?.linkedin_url ||
          result.person_info?.linkedin_profile ||
          result.person_info?.LinkedIn_Profile ||
          "",
        website: result.domain ? `https://${result.domain}` : "",
        lead_source: "Contact Finder",
        source: "contact_finder",
        notes: `Found via Contact Finder. ${result.confidence ? `Confidence: ${result.confidence}%` : ""} ${enrichedData?.summary ? `Summary: ${enrichedData.summary.substring(0, 200)}...` : ""}`,
        custom_field_1: result.confidence ? `${result.confidence}% confidence` : "",
        custom_field_2: enrichedData?.city
          ? `${enrichedData.city}${enrichedData.state ? `, ${enrichedData.state}` : ""}`
          : "",
        custom_field_3: enrichedData?.follower_count ? `${enrichedData.follower_count} LinkedIn followers` : "",
      }

      const response = await fetch(`${API_URL}/add-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          alert("This contact already exists in your database.")
        } else {
          throw new Error(data.error || "Failed to add contact")
        }
        return
      }

      setAddedToContacts(true)
      alert(`✅ Contact added successfully! Contact ID: ${data.contact_id}`)
    } catch (error: any) {
      console.error("Add contact error:", error)
      alert(`❌ Failed to add contact: ${error.message}`)
    } finally {
      setAddingToContacts(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur shadow-xl rounded-xl border-0">
      <div className="p-8">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-8">
          {enrichedData?.profile_pic_url || enrichedData?.s3_profile_pic_url ? (
            <img
              src={enrichedData.s3_profile_pic_url || enrichedData.profile_pic_url}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName || "Contact")}&background=3B82F6&color=ffffff&size=80`
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {(employeeName || "C")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {enrichedData?.full_name || employeeName || "Contact Found"}
                </h2>
                {(() => {
                  const linkedinUrl =
                    result?.person_info?.linkedin_profile ||
                    result?.person_info?.LinkedIn_Profile ||
                    enrichedData?.linkedin_url

                  return linkedinUrl && linkedinUrl !== "N/A" && linkedinUrl !== "#" ? (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center mb-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View LinkedIn Profile
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500 mb-2">No LinkedIn URL found</div>
                  )
                })()}
                {enrichedData?.city && (
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {enrichedData.city}
                    {enrichedData.state ? `, ${enrichedData.state}` : ""}
                    {enrichedData.country_full_name ? `, ${enrichedData.country_full_name}` : ""}
                  </p>
                )}
              </div>
              {result.confidence && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {result.confidence}% confidence
                </div>
              )}
            </div>

            {/* LinkedIn and follower info */}
            {enrichedData && (
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                {enrichedData.follower_count && (
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {enrichedData.follower_count} followers
                  </span>
                )}
                {enrichedData.connections && (
                  <span className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    {enrichedData.connections} connections
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Email and Domain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {result.predicted_email && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <p className="text-sm font-semibold text-blue-700 mb-2">Predicted Email</p>
              <p className="text-lg font-bold text-gray-900 break-all">{result.predicted_email}</p>
            </div>
          )}

          {result.domain && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
              <p className="text-sm font-semibold text-gray-700 mb-2">Domain</p>
              <p className="text-lg font-bold text-gray-900">{result.domain}</p>
            </div>
          )}
        </div>

        {/* Title and Headline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
            <p className="text-sm font-semibold text-blue-700 mb-2">Professional Title</p>
            <p className="text-lg font-bold text-gray-900">
              {enrichedData?.headline || result.person_info?.title || "Professional"}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
            <p className="text-sm font-semibold text-blue-700 mb-2">Profile Summary</p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {enrichedData?.summary || result.person_info?.snippet || "Professional profile information"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            className="px-6 py-3 border-2 border-blue-200 hover:bg-blue-50 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center"
            onClick={onEnrichProfile}
            disabled={enriching}
          >
            {enriching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enriching...
              </>
            ) : (
              "Enrich Profile"
            )}
          </button>
          <button
            className="px-6 py-3 border-2 border-purple-200 hover:bg-purple-50 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center"
            onClick={onGenerateAISummary}
            disabled={generating || !result}
            title={!result ? "Search for a contact first to generate AI summary" : ""}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate AI Summary"
            )}
          </button>
          {result?.predicted_email && (
            <button
              className={`px-6 py-3 border-2 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center ${
                addedToContacts
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-orange-200 hover:bg-orange-50 text-orange-700"
              }`}
              onClick={addToContact}
              disabled={addingToContacts || addedToContacts}
            >
              {addingToContacts ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding to Contacts...
                </>
              ) : addedToContacts ? (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Added to Contacts ✓
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Add to Contacts
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab Navigation - FIXED: AI Summary tab shows independently */}
        <div className="mt-8">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {/* Basic Info Tab - Always available when we have results */}
              <button
                onClick={() => setActiveTab("basic")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "basic"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Basic Info
              </button>

              {/* Enriched Data Tabs - Only show when enriched data exists */}
              {enrichedData && (
                <>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "overview"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("experience")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "experience"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Experience
                  </button>
                  <button
                    onClick={() => setActiveTab("education")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "education"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Education
                  </button>
                  <button
                    onClick={() => setActiveTab("skills")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "skills"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Skills {skillsList.length > 0 && `(${skillsList.length})`}
                  </button>
                  <button
                    onClick={() => setActiveTab("contact")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "contact"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Contact Info
                  </button>
                </>
              )}

              {/* AI Summary Tab - FIXED: Shows independently of enriched data */}
              {aiSummary && (
                <button
                  onClick={() => setActiveTab("ai-summary")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "ai-summary"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  AI Summary
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Basic Info Tab - FIXED: Default tab for basic search results */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-2">Full Name</p>
                      <p className="text-gray-900 font-semibold">
                        {enrichedData?.full_name || employeeName || "Not specified"}
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-2">Professional Title</p>
                      <p className="text-gray-900 font-semibold">
                        {enrichedData?.headline || result.person_info?.title || "Not specified"}
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-purple-700 mb-2">Predicted Email</p>
                      <p className="text-gray-900 font-semibold break-all">
                        {result.predicted_email || "Not available"}
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-orange-700 mb-2">Company Domain</p>
                      <p className="text-gray-900 font-semibold">{result.domain || "Not available"}</p>
                    </div>
                  </div>

                  {(enrichedData?.summary || result.person_info?.snippet) && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Profile Summary</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">
                          {enrichedData?.summary || result.person_info?.snippet}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === "overview" && enrichedData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-2">Professional Title</p>
                      <p className="text-gray-900 font-semibold">
                        {enrichedData.headline || enrichedData.occupation || "Not specified"}
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-2">Location</p>
                      <p className="text-gray-900 font-semibold">
                        {enrichedData.city
                          ? `${enrichedData.city}${enrichedData.state ? `, ${enrichedData.state}` : ""}${enrichedData.country_full_name ? `, ${enrichedData.country_full_name}` : ""}`
                          : "Not specified"}
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-purple-700 mb-2">LinkedIn Followers</p>
                      <p className="text-gray-900 font-semibold">
                        {enrichedData.follower_count ? `${enrichedData.follower_count} followers` : "Not available"}
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-orange-700 mb-2">Connections</p>
                      <p className="text-gray-900 font-semibold">
                        {enrichedData.connections ? `${enrichedData.connections} connections` : "Not available"}
                      </p>
                    </div>
                  </div>

                  {enrichedData.summary && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Professional Summary</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{enrichedData.summary}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === "experience" && enrichedData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h3>
                  {enrichedData.experiences && enrichedData.experiences.length > 0 ? (
                    <div className="space-y-4">
                      {enrichedData.experiences.slice(0, 5).map((exp: any, index: number) => {
                        // Helper function to format date objects
                        const formatDate = (dateObj: any) => {
                          if (!dateObj) return null
                          if (typeof dateObj === "string") return dateObj
                          if (typeof dateObj === "object" && dateObj.year) {
                            const month = dateObj.month ? String(dateObj.month).padStart(2, "0") : "01"
                            const day = dateObj.day ? String(dateObj.day).padStart(2, "0") : "01"
                            return `${dateObj.year}-${month}-${day}`
                          }
                          return null
                        }

                        const startDate = formatDate(exp.starts_at)
                        const endDate = formatDate(exp.ends_at)

                        return (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900">{exp.title || "Job Title"}</h4>
                                <p className="text-lg text-blue-600 font-semibold">{exp.company || "Company"}</p>
                              </div>
                              <div className="text-right text-sm text-gray-600">
                                {(startDate || endDate) && (
                                  <p>
                                    {startDate || "Start"} - {endDate || "Present"}
                                  </p>
                                )}
                                {exp.location && (
                                  <p className="flex items-center justify-end mt-1">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {exp.location}
                                  </p>
                                )}
                              </div>
                            </div>

                            {exp.description && (
                              <div className="bg-white/50 p-4 rounded-lg">
                                <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No work experience data available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education Tab - FIXED: Better data handling */}
            {activeTab === "education" && enrichedData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                  {enrichedData.education &&
                  Array.isArray(enrichedData.education) &&
                  enrichedData.education.length > 0 ? (
                    <div className="space-y-4">
                      {enrichedData.education.map((edu: any, index: number) => {
                        // Helper function to format date objects
                        const formatDate = (dateObj: any) => {
                          if (!dateObj) return null
                          if (typeof dateObj === "string") return dateObj
                          if (typeof dateObj === "object" && dateObj.year) {
                            const month = dateObj.month ? String(dateObj.month).padStart(2, "0") : "01"
                            const day = dateObj.day ? String(dateObj.day).padStart(2, "0") : "01"
                            return `${dateObj.year}-${month}-${day}`
                          }
                          return null
                        }

                        const startDate = formatDate(edu.starts_at)
                        const endDate = formatDate(edu.ends_at)

                        return (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{edu.school || "School"}</h4>
                                {edu.degree_name && (
                                  <p className="text-lg text-green-600 font-semibold mb-1">{edu.degree_name}</p>
                                )}
                                {edu.field_of_study && (
                                  <p className="text-gray-600 mb-2">Field of Study: {edu.field_of_study}</p>
                                )}
                                {edu.description && <p className="text-gray-600 text-sm">{edu.description}</p>}
                              </div>
                              <div className="text-right text-sm text-gray-600 ml-4">
                                {(startDate || endDate) && (
                                  <p>
                                    {startDate || "Start"} - {endDate || "Present"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No education data available</p>
                      <p className="text-sm mt-2">Education information will appear here after profile enrichment</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && enrichedData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Skills & Expertise
                    {skillsList.length > 0 && (
                      <span className="ml-2 text-sm text-gray-500">({skillsList.length} skills)</span>
                    )}
                  </h3>
                  {skillsList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {skillsList.map((skill: string, index: number) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3 rounded-lg border border-purple-200 text-center hover:shadow-md transition-shadow"
                        >
                          <span className="text-purple-800 font-medium">{skill}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No skills data available</p>
                      <p className="text-sm mt-2">Skills will appear here after profile enrichment</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info Tab */}
            {activeTab === "contact" && enrichedData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal emails */}
                    {enrichedData.personal_emails && enrichedData.personal_emails.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                          <Mail className="h-5 w-5 mr-2 text-red-600" />
                          <span className="font-semibold text-gray-700">Personal Email</span>
                        </div>
                        {enrichedData.personal_emails.map((email: string, idx: number) => (
                          <a
                            key={idx}
                            href={`mailto:${email}`}
                            className="text-blue-600 hover:underline break-all block"
                          >
                            {email}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Phone numbers */}
                    {enrichedData.personal_numbers && enrichedData.personal_numbers.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                          <Globe className="h-5 w-5 mr-2 text-green-600" />
                          <span className="font-semibold text-gray-700">Phone</span>
                        </div>
                        {enrichedData.personal_numbers.map((phone: string, idx: number) => (
                          <a key={idx} href={`tel:${phone}`} className="text-blue-600 hover:underline break-all block">
                            {phone}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* LinkedIn */}
                    {enrichedData.linkedin_url && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-2">
                          <User className="h-5 w-5 mr-2 text-blue-600" />
                          <span className="font-semibold text-gray-700">LinkedIn</span>
                        </div>
                        <a
                          href={enrichedData.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {enrichedData.linkedin_url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Show message if no contact info */}
                  {(!enrichedData.personal_emails || enrichedData.personal_emails.length === 0) &&
                    (!enrichedData.personal_numbers || enrichedData.personal_numbers.length === 0) &&
                    !enrichedData.linkedin_url && (
                      <div className="text-center py-8 text-gray-500">
                        <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No additional contact information available</p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* AI Summary Tab - FIXED: No debug info, works independently */}
            {activeTab === "ai-summary" && aiSummary && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Summary & Outreach</h3>

                  {/* Professional Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 mb-6">
                    <h4 className="text-md font-semibold text-purple-800 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Professional Summary
                    </h4>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-800 leading-relaxed">
                        {typeof aiSummary === "object" && aiSummary.summary
                          ? aiSummary.summary
                          : typeof aiSummary === "string"
                            ? aiSummary
                            : "No summary available"}
                      </p>
                    </div>
                  </div>

                  {/* Talking Points */}
                  {typeof aiSummary === "object" && aiSummary.talking_points && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-6">
                      <h4 className="text-md font-semibold text-blue-800 mb-3 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2" />
                        Key Talking Points
                      </h4>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">{aiSummary.talking_points}</p>
                      </div>
                    </div>
                  )}

                  {/* Icebreaker */}
                  {typeof aiSummary === "object" && aiSummary.icebreaker && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <h4 className="text-md font-semibold text-green-800 mb-3 flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Cold Email Icebreaker
                      </h4>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-800 leading-relaxed italic">"{aiSummary.icebreaker}"</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiSummary.icebreaker)
                          console.log("✅ Icebreaker copied to clipboard!")
                        }}
                        className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Copy Icebreaker
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactFinder() {
  const [employeeDetails, setEmployeeDetails] = useState({
    employeeName: "",
    companyName: "",
    location: "",
    title: "",
  })
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchMode, setSearchMode] = useState<"name" | "linkedin">("name")

  const [enriching, setEnriching] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [enrichedData, setEnrichedData] = useState<any>(null)
  const [aiSummary, setAiSummary] = useState<string>("")
  const [activeTab, setActiveTab] = useState("basic") // FIXED: Default to basic tab

  const [companySuggestions, setCompanySuggestions] = useState([])
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)
  const [disableCompanySuggestions, setDisableCompanySuggestions] = useState(false)
  const companyInputRef = useRef<HTMLInputElement>(null)

  const { user, error: authError, isLoading: authLoading, loginWithRedirect } = useAuth0()

  // Check if user is logged in
  const authContent = () => {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading authentication...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-4">You need to be logged in to use the Contact Finder.</p>
            <button
              onClick={() => loginWithRedirect()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Log In
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      // Don't close if clicking on the suggestions dropdown
      if (target.closest(".company-suggestions-dropdown")) {
        return
      }

      // Close if clicking outside the company input
      if (companyInputRef.current && !companyInputRef.current.contains(target)) {
        setShowCompanySuggestions(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (employeeDetails.companyName === "") {
      setDisableCompanySuggestions(false)
      setShowCompanySuggestions(false)
    }
  }, [employeeDetails.companyName])

  const fetchCompanySuggestions = debounce(async (query) => {
    if (!query || query.length < 2) {
      setCompanySuggestions([])
      setShowCompanySuggestions(false)
      return
    }

    if (disableCompanySuggestions) {
      return
    }

    try {
      if (!API_URL) {
        const mockSuggestions = [
          { company_name: "Apple Inc", domain: "apple.com" },
          { company_name: "Microsoft Corporation", domain: "microsoft.com" },
          { company_name: "Google LLC", domain: "google.com" },
          { company_name: "Amazon.com Inc", domain: "amazon.com" },
          { company_name: "Meta Platforms Inc", domain: "meta.com" },
          { company_name: "Tesla Inc", domain: "tesla.com" },
          { company_name: "Netflix Inc", domain: "netflix.com" },
          { company_name: "Salesforce Inc", domain: "salesforce.com" },
          { company_name: "Adobe Inc", domain: "adobe.com" },
          { company_name: "Oracle Corporation", domain: "oracle.com" },
        ].filter(
          (company) =>
            company.company_name.toLowerCase().includes(query.toLowerCase()) ||
            company.domain.toLowerCase().includes(query.toLowerCase()),
        )

        setCompanySuggestions(mockSuggestions)
        setShowCompanySuggestions(mockSuggestions.length > 0)
        return
      }

      const res = await fetch(`${API_URL}/company-suggestions?q=${encodeURIComponent(query)}`)
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`)
      }

      const data = await res.json()
      setCompanySuggestions(data || [])
      setShowCompanySuggestions(data && data.length > 0)
    } catch (err) {
      console.error("Company suggestion fetch failed:", err)
      setCompanySuggestions([])
      setShowCompanySuggestions(false)
    }
  }, 200)

  const domainToCompanyName = (domain: string) => {
    if (!domain) return domain

    let name = domain.replace("www.", "").split(".")[0]
    name = name.replace(/([a-z])([A-Z])/g, "$1 $2")
    name = name.replace(
      /([a-z])(youth|ranch|inc|llc|corp|solutions|creative|realty|company|tech|soft|ware|group|media|design|studio)/gi,
      "$1 $2",
    )

    name = name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

    if (!name.match(/(Inc|LLC|Corp|Company|Group|Solutions)$/i)) {
      name += " Inc"
    }

    return name
  }

  const handleCompanySuggestionClick = (suggestion: any) => {
    // Use the exact company name from DB or display name
    const companyName = suggestion.company_name.includes(".")
      ? domainToCompanyName(suggestion.company_name)
      : suggestion.company_name

    setEmployeeDetails({ ...employeeDetails, companyName })
    setCompanySuggestions([])
    setShowCompanySuggestions(false)
    // Don't disable suggestions completely - user might want to change
    if (companyInputRef.current) {
      companyInputRef.current.blur() // Remove focus to hide suggestions
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Hide suggestions and reset state
    setCompanySuggestions([])
    setShowCompanySuggestions(false)
    setDisableCompanySuggestions(false)

    setLoading(true)
    setEnrichedData(null)
    setAiSummary("")
    setError(null)
    setResult(null)
    setActiveTab("basic") // FIXED: Reset to basic tab

    if (!employeeDetails.employeeName.trim() || !employeeDetails.companyName.trim()) {
      setError("Please provide both name and company information.")
      setLoading(false)
      return
    }

    try {
      if (!user?.email) {
        setError("No email found in user profile. Please check your Auth0 configuration.")
        setLoading(false)
        return
      }

      const userEmail = user.email

      const requestBody = {
        employee_name: employeeDetails.employeeName.trim(),
        company_name: employeeDetails.companyName.trim(),
        location: employeeDetails.location.trim() || "",
        title: employeeDetails.title.trim() || "",
        email: "",
      }

      const apiUrl = `${API_URL}/validate_employee?email=${encodeURIComponent(userEmail)}`

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (error: any) {
      console.error("Search error:", error)
      setError(error.message || "An error occurred while searching for the contact.")
    }

    setLoading(false)
  }

  const handleLinkedInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEnrichedData(null)
    setAiSummary("")
    setError(null)
    setResult(null)
    setActiveTab("basic") // FIXED: Reset to basic tab

    if (!linkedinUrl.trim()) {
      setError("Please provide a LinkedIn URL.")
      setLoading(false)
      return
    }

    if (!user?.email) {
      setError("User email not available from Auth0.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/linkedin-finder?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ linkedin_url: linkedinUrl }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (error: any) {
      console.error("LinkedIn search failed:", error)
      setError(error.message || "An error occurred while searching for the contact.")
    }

    setLoading(false)
  }

  const handleEnrichProfile = async () => {
    const linkedinUrl = result.person_info?.LinkedIn_Profile || result.person_info?.linkedin_profile

    setEnriching(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/enrich_profile?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkedin_url: linkedinUrl || "https://www.linkedin.com/in/test",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}: ${errorText}`)
      }

      const enrichedProfile = await response.json()
      setEnrichedData(enrichedProfile)

      // Auto-switch to overview tab to show enriched data
      setActiveTab("overview")
    } catch (error: any) {
      console.error("Enrichment failed:", error)
      setError(`Failed to enrich profile: ${error.message}`)
    }

    setEnriching(false)
  }

  // FIXED: Simplified AI Summary Generation - works independently
  const handleGenerateAISummary = async () => {
    setGenerating(true)
    setError(null)

    try {
      // Build simplified payload using available data
      const summaryPayload = {
        profile_data: {
          // Basic information
          full_name: enrichedData?.full_name || employeeDetails.employeeName || "Unknown Contact",
          occupation:
            enrichedData?.occupation ||
            enrichedData?.headline ||
            result?.person_info?.title ||
            employeeDetails.title ||
            "Professional",
          headline: enrichedData?.headline || result?.person_info?.title || employeeDetails.title || "Professional",

          // Location data
          city: enrichedData?.city || employeeDetails.location?.split(",")[0]?.trim() || "",
          state:
            enrichedData?.state ||
            (employeeDetails.location?.includes(",") ? employeeDetails.location.split(",")[1]?.trim() : "") ||
            "",
          country_full_name: enrichedData?.country_full_name || "",

          // Skills array
          skills: (() => {
            if (!enrichedData?.skills) return []

            if (Array.isArray(enrichedData.skills)) {
              return enrichedData.skills
                .map((skill: any) => {
                  if (typeof skill === "string") return skill.trim()
                  if (typeof skill === "object" && skill.name) return skill.name.trim()
                  if (typeof skill === "object" && skill.skill) return skill.skill.trim()
                  return String(skill).trim()
                })
                .filter(Boolean)
                .slice(0, 20)
            }

            if (typeof enrichedData.skills === "string") {
              return enrichedData.skills
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
                .slice(0, 20)
            }

            return []
          })(),

          // Professional summary
          summary: enrichedData?.summary || result?.person_info?.snippet || "Professional profile information",

          // Company and contact info
          company: employeeDetails.companyName || result?.domain || "Unknown Company",
          predicted_email: result?.predicted_email || "Not available",
          linkedin_url:
            enrichedData?.linkedin_url ||
            result?.person_info?.linkedin_profile ||
            result?.person_info?.LinkedIn_Profile ||
            "Not available",

          // Experience summary
          recent_experience:
            enrichedData?.experiences
              ?.slice(0, 2)
              ?.map(
                (exp: any) =>
                  `${exp.title || "Position"} at ${exp.company || "Company"}${exp.description ? `: ${exp.description.substring(0, 100)}...` : ""}`,
              )
              .join("; ") || "No recent experience data",

          // Education summary
          education_summary:
            enrichedData?.education
              ?.slice(0, 2)
              ?.map(
                (edu: any) =>
                  `${edu.degree_name || "Degree"} from ${edu.school || "Institution"}${edu.field_of_study ? ` in ${edu.field_of_study}` : ""}`,
              )
              .join("; ") || "No education data",

          // Social metrics
          follower_count: enrichedData?.follower_count || 0,
          connections: enrichedData?.connections || 0,
        },
      }

      const response = await fetch(`${API_URL}/generate_summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(summaryPayload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      // Parse the AI response - FIXED: Handle malformed JSON with escaped quotes
      let parsedSummary
      try {
        console.log("🔍 Raw AI response:", data)

        let rawSummary = data.summary || JSON.stringify(data)
        console.log("🔍 Raw summary string:", rawSummary)

        // Handle the backend format: '{"summary": "...", "talking_points": "...", "icebreaker": "..."}'
        if (typeof rawSummary === "string") {
          // Remove outer quotes (single or double)
          rawSummary = rawSummary.trim()
          if (
            (rawSummary.startsWith("'") && rawSummary.endsWith("'")) ||
            (rawSummary.startsWith('"') && rawSummary.endsWith('"'))
          ) {
            rawSummary = rawSummary.slice(1, -1)
          }

          // Clean up escaped characters
          rawSummary = rawSummary.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\").replace(/\\'/g, "'")

          console.log("🧹 Cleaned summary string:", rawSummary)

          // Try to parse as JSON
          parsedSummary = JSON.parse(rawSummary)
          console.log("✅ Successfully parsed JSON:", parsedSummary)
        } else if (typeof rawSummary === "object") {
          parsedSummary = rawSummary
          console.log("✅ Summary was already an object:", parsedSummary)
        }
      } catch (jsonError) {
        console.log("❌ JSON parsing failed, using improved regex extraction:", jsonError)

        // Improved fallback regex that handles the exact backend format
        const rawText = typeof data.summary === "string" ? data.summary : JSON.stringify(data)
        console.log("🔍 Raw text for regex extraction:", rawText)

        // Better regex patterns that handle nested quotes and content properly
        const summaryMatch = rawText.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/i)
        const talkingPointsMatch = rawText.match(/"talking_points"\s*:\s*"((?:[^"\\]|\\.)*)"/i)
        const icebreakerMatch = rawText.match(/"icebreaker"\s*:\s*"((?:[^"\\]|\\.)*)"/i)

        console.log("🔍 Regex extraction results:", {
          summaryFound: !!summaryMatch,
          talkingPointsFound: !!talkingPointsMatch,
          icebreakerFound: !!icebreakerMatch,
        })

        // Clean extracted text
        const cleanExtractedText = (text: string | null) => {
          if (!text) return null
          return text.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\").replace(/\\'/g, "'")
        }

        parsedSummary = {
          summary: cleanExtractedText(summaryMatch?.[1]) || "Unable to extract summary from AI response",
          talking_points:
            cleanExtractedText(talkingPointsMatch?.[1]) || "Unable to extract talking points from AI response",
          icebreaker: cleanExtractedText(icebreakerMatch?.[1]) || "Unable to extract icebreaker from AI response",
        }

        console.log("✅ Final regex extracted summary:", parsedSummary)
      }

      console.log("🎯 Final parsed summary:", parsedSummary)

      setAiSummary(parsedSummary)

      // Auto-switch to AI summary tab when generated
      setActiveTab("ai-summary")
    } catch (error: any) {
      console.error("AI summary generation failed:", error)
      setError(`Failed to generate AI summary: ${error.message}`)
    }

    setGenerating(false)
  }

  const resetForm = () => {
    setEmployeeDetails({
      employeeName: "",
      companyName: "",
      location: "",
      title: "",
    })
    setLinkedinUrl("")
    setResult(null)
    setError(null)
    setEnrichedData(null)
    setAiSummary("")
    setCompanySuggestions([])
    setShowCompanySuggestions(false)
    setDisableCompanySuggestions(false)
    setActiveTab("basic") // FIXED: Reset to basic tab
  }

  const authContentElement = authContent()
  if (authContentElement) {
    return authContentElement
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors" onClick={resetForm}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Finder</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find professional contact information with AI-powered insights and LinkedIn integration
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search Form */}
            <div className="bg-white/80 backdrop-blur shadow-xl rounded-xl border-0 lg:col-span-1">
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                    <button
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                        searchMode === "name" ? "text-white bg-blue-600" : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => {
                        setSearchMode("name")
                        resetForm()
                      }}
                    >
                      Name & Company
                    </button>
                    <button
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                        searchMode === "linkedin" ? "text-white bg-blue-600" : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => {
                        setSearchMode("linkedin")
                        resetForm()
                      }}
                    >
                      LinkedIn URL
                    </button>
                  </div>

                  {searchMode === "name" ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-blue-600 mr-3" />
                          <label htmlFor="employeeName" className="font-semibold text-gray-700">
                            Full Name
                          </label>
                          <span className="ml-2 text-xs text-red-500">*</span>
                        </div>
                        <input
                          id="employeeName"
                          type="text"
                          placeholder="Jane Doe"
                          value={employeeDetails.employeeName}
                          onChange={(e) => setEmployeeDetails({ ...employeeDetails, employeeName: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Building className="h-5 w-5 text-blue-600 mr-3" />
                          <label htmlFor="companyName" className="font-semibold text-gray-700">
                            Company
                          </label>
                          <span className="ml-2 text-xs text-red-500">*</span>
                        </div>
                        <div className="relative">
                          <input
                            ref={companyInputRef}
                            id="companyName"
                            type="text"
                            placeholder="Acme Inc"
                            value={employeeDetails.companyName}
                            onChange={(e) => {
                              const value = e.target.value
                              setEmployeeDetails({ ...employeeDetails, companyName: value })

                              // Always allow suggestions if user is typing
                              if (value.length >= 2) {
                                setDisableCompanySuggestions(false)
                                fetchCompanySuggestions(value)
                              } else {
                                setShowCompanySuggestions(false)
                              }
                            }}
                            onFocus={() => {
                              // Show suggestions when focused if we have a query
                              if (employeeDetails.companyName.length >= 2) {
                                fetchCompanySuggestions(employeeDetails.companyName)
                              }
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                            required
                            autoComplete="off"
                          />

                          {/* Company Suggestions Dropdown with proper z-index */}
                          {showCompanySuggestions && companySuggestions.length > 0 && (
                            <div className="company-suggestions-dropdown absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto mt-1">
                              <div className="py-1">
                                {companySuggestions.map((suggestion: any, idx) => {
                                  const displayName = suggestion.company_name.includes(".")
                                    ? domainToCompanyName(suggestion.company_name)
                                    : suggestion.company_name

                                  return (
                                    <div
                                      key={`${suggestion.company_name}-${idx}`}
                                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                      onClick={() => {
                                        setEmployeeDetails({ ...employeeDetails, companyName: displayName })
                                        setCompanySuggestions([])
                                        setShowCompanySuggestions(false)
                                        setTimeout(() => {
                                          if (companyInputRef.current) {
                                            companyInputRef.current.focus()

                                            companyInputRef.current.focus()
                                          }
                                        }, 100)
                                      }}
                                    >
                                      <div className="flex items-center">
                                        <Building className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900 text-sm">{displayName}</div>
                                          <div className="text-xs text-gray-500">{suggestion.domain}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                          <label htmlFor="location" className="font-semibold text-gray-700">
                            Location
                          </label>
                          <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                        </div>
                        <input
                          id="location"
                          type="text"
                          placeholder="New York, NY"
                          value={employeeDetails.location}
                          onChange={(e) => setEmployeeDetails({ ...employeeDetails, location: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-blue-600 mr-3" />
                          <label htmlFor="title" className="font-semibold text-gray-700">
                            Title
                          </label>
                          <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                        </div>
                        <input
                          id="title"
                          type="text"
                          placeholder="Software Engineer"
                          value={employeeDetails.title}
                          onChange={(e) => setEmployeeDetails({ ...employeeDetails, title: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-5 w-5" />
                            Find Contact
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleLinkedInSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <ExternalLink className="h-5 w-5 text-blue-600 mr-3" />
                          <label htmlFor="linkedinUrl" className="font-semibold text-gray-700">
                            LinkedIn URL
                          </label>
                          <span className="ml-2 text-xs text-red-500">*</span>
                        </div>
                        <input
                          id="linkedinUrl"
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-5 w-5" />
                            Find Contact
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Result */}
            <div className="lg:col-span-2">
              <ContactResult
                result={result}
                enrichedData={enrichedData}
                aiSummary={aiSummary}
                onEnrichProfile={handleEnrichProfile}
                onGenerateAISummary={handleGenerateAISummary}
                error={error}
                employeeName={employeeDetails.employeeName}
                loading={loading}
                enriching={enriching}
                generating={generating}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
