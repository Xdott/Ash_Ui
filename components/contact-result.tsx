"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  ExternalLink,
  Loader2,
  User,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Phone,
  Mail,
  Star,
  Check,
  X,
} from "lucide-react"

interface ContactResultProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contact: any
  enrichedData: any
  aiSummary?: string
  enriching?: boolean
  generating?: boolean
  onEnrichProfile?: () => void
  onGenerateAISummary?: () => void
  error?: string | null
  loading?: boolean
  activeTab?: string
  setActiveTab?: (tab: string) => void
  isApprovalMode?: boolean
  onApprove?: () => void
  onReject?: () => void
  approving?: boolean
}

export default function ContactResult({
  open = false,
  onOpenChange,
  contact,
  enrichedData,
  aiSummary,
  enriching = false,
  generating = false,
  onEnrichProfile,
  onGenerateAISummary,
  error,
  loading = false,
  activeTab = "overview",
  setActiveTab,
  isApprovalMode = false,
  onApprove,
  onReject,
  approving = false,
}: ContactResultProps) {
  console.log("📧 ContactResult enrichedData:", enrichedData)

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <Card className="shadow-xl border-0 bg-blue-50 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="text-blue-600 mb-4">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold mb-2">Loading Contact Data...</h3>
                <p>Please wait while we load the enriched information.</p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <Card className="shadow-xl border-0 bg-red-50 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
                <p>{error}</p>
              </div>
              <Button variant="outline" className="border-2 border-red-200 text-red-600 hover:bg-red-100">
                Close
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  if (!enrichedData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <Card className="shadow-xl border-0 bg-white/50 backdrop-blur h-full">
            <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[500px]">
              <div className="text-center text-gray-500 max-w-md">
                <div className="bg-blue-100 p-8 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                  <Search className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-700">No Enrichment Data</h3>
                <p className="text-gray-600 leading-relaxed">
                  This contact hasn't been enriched yet. Click "Enrich" to get detailed information.
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  const displayName =
    enrichedData?.full_name ||
    contact?.full_name ||
    `${contact?.first_name || ""} ${contact?.last_name || ""}`.trim() ||
    "Contact"

  // Tab definitions
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "skills", label: "Skills & More", icon: Star },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Email */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Primary Email
                </p>
                <p className="text-lg font-bold text-gray-900 break-all">{contact?.email || "Not Available"}</p>
              </div>

              {/* Location */}
              {(enrichedData?.city || enrichedData?.state || enrichedData?.country) && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                  <p className="text-sm font-semibold text-green-700 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {[enrichedData?.city, enrichedData?.state, enrichedData?.country_full_name || enrichedData?.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}

              {/* Current Position */}
              {enrichedData?.occupation && (
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl">
                  <p className="text-sm font-semibold text-purple-700 mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Current Position
                  </p>
                  <p className="text-lg font-bold text-gray-900">{enrichedData.occupation}</p>
                </div>
              )}

              {/* LinkedIn Connections */}
              {enrichedData?.connections && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
                  <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    LinkedIn Network
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {enrichedData.connections} connections
                    {enrichedData.follower_count && ` • ${enrichedData.follower_count} followers`}
                  </p>
                </div>
              )}
            </div>

            {/* Professional Summary */}
            {enrichedData?.summary && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Professional Summary
                </p>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{enrichedData.summary}</p>
              </div>
            )}

            {/* Additional Contact Info */}
            {(enrichedData?.personal_emails?.length > 0 || enrichedData?.personal_numbers?.length > 0) && (
              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Additional Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrichedData.personal_emails && enrichedData.personal_emails.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Personal Emails</p>
                      {enrichedData.personal_emails.map((email: string, index: number) => (
                        <p key={index} className="text-sm text-green-800 mb-1 break-all">
                          {email}
                        </p>
                      ))}
                    </div>
                  )}
                  {enrichedData.personal_numbers && enrichedData.personal_numbers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Phone Numbers</p>
                      {enrichedData.personal_numbers.map((phone: string, index: number) => (
                        <p key={index} className="text-sm text-green-800 mb-1">
                          {phone}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case "experience":
        return (
          <div className="space-y-4">
            {enrichedData?.experiences && enrichedData.experiences.length > 0 ? (
              enrichedData.experiences.map((exp: any, index: number) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-purple-800">{exp.title || "Position"}</h3>
                      <p className="text-purple-600 font-medium">{exp.company || "Company"}</p>
                    </div>
                    <div className="text-right text-sm text-purple-600 ml-4">
                      {exp.starts_at && (
                        <p>
                          {exp.starts_at.year && exp.starts_at.month
                            ? new Date(exp.starts_at.year, exp.starts_at.month - 1).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                            : "Start Date"}
                        </p>
                      )}
                      {exp.ends_at ? (
                        <p>
                          to{" "}
                          {exp.ends_at.year && exp.ends_at.month
                            ? new Date(exp.ends_at.year, exp.ends_at.month - 1).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                            : "End Date"}
                        </p>
                      ) : (
                        <p>to Present</p>
                      )}
                    </div>
                  </div>
                  {exp.location && (
                    <p className="text-sm text-purple-600 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {exp.location}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No experience data available in enrichment.</p>
              </div>
            )}
          </div>
        )

      case "education":
        return (
          <div className="space-y-4">
            {enrichedData?.education && enrichedData.education.length > 0 ? (
              enrichedData.education.map((edu: any, index: number) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-800">{edu.school || "Institution"}</h3>
                      <p className="text-blue-600 font-medium">{edu.degree_name || "Degree"}</p>
                      {edu.field_of_study && <p className="text-blue-600">{edu.field_of_study}</p>}
                    </div>
                    <div className="text-right text-sm text-blue-600 ml-4">
                      {edu.starts_at && (
                        <p>
                          {edu.starts_at.year && edu.starts_at.month
                            ? new Date(edu.starts_at.year, edu.starts_at.month - 1).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                            : "Start"}
                        </p>
                      )}
                      {edu.ends_at && (
                        <p>
                          to{" "}
                          {edu.ends_at.year && edu.ends_at.month
                            ? new Date(edu.ends_at.year, edu.ends_at.month - 1).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                            : "End"}
                        </p>
                      )}
                    </div>
                  </div>
                  {edu.description && <p className="text-sm text-blue-800 leading-relaxed">{edu.description}</p>}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No education data available in enrichment.</p>
              </div>
            )}
          </div>
        )

      case "certifications":
        return (
          <div className="space-y-4">
            {enrichedData?.certifications && enrichedData.certifications.length > 0 ? (
              enrichedData.certifications.map((cert: any, index: number) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-yellow-800">{cert.name || "Certification"}</h4>
                      {cert.authority && <p className="text-yellow-700 font-medium">Issued by {cert.authority}</p>}
                      {cert.license_number && <p className="text-sm text-yellow-600">License: {cert.license_number}</p>}
                    </div>
                    <div className="text-right text-sm text-yellow-600 ml-4">
                      {cert.starts_at && (
                        <p>
                          {cert.starts_at.year && cert.starts_at.month
                            ? new Date(cert.starts_at.year, cert.starts_at.month - 1).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                            : "Issued"}
                        </p>
                      )}
                      {cert.ends_at && (
                        <p>
                          Expires:{" "}
                          {cert.ends_at.year && cert.ends_at.month
                            ? new Date(cert.ends_at.year, cert.ends_at.month - 1).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-yellow-700 hover:underline flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Certificate
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No certifications data available in enrichment.</p>
              </div>
            )}
          </div>
        )

      case "skills":
        return (
          <div className="space-y-6">
            {/* Skills */}
            {enrichedData?.skills && enrichedData.skills.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {enrichedData.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm rounded-full font-medium border border-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Languages */}
            {enrichedData?.languages && enrichedData.languages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {enrichedData.languages.map((language: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm rounded-full font-medium border border-blue-200"
                    >
                      {typeof language === "string" ? language : language.name || "Language"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Groups */}
            {enrichedData?.groups && enrichedData.groups.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Groups</h3>
                <div className="space-y-3">
                  {enrichedData.groups.map((group: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200"
                    >
                      <h4 className="font-semibold text-indigo-800">{group.name || "Group"}</h4>
                      {group.url && (
                        <a
                          href={group.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-700 hover:underline flex items-center mt-1"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Group
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* People Also Viewed */}
            {enrichedData?.people_also_viewed && enrichedData.people_also_viewed.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">People Also Viewed</h3>
                <div className="space-y-3">
                  {enrichedData.people_also_viewed.slice(0, 5).map((person: any, index: number) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-800">{person.name || "Professional"}</h4>
                      {person.summary && <p className="text-sm text-gray-600">{person.summary}</p>}
                      {person.location && <p className="text-xs text-gray-500">{person.location}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no skills data */}
            {(!enrichedData?.skills || enrichedData.skills.length === 0) &&
              (!enrichedData?.languages || enrichedData.languages.length === 0) &&
              (!enrichedData?.groups || enrichedData.groups.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No additional skills or profile data available in enrichment.</p>
                </div>
              )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Contact Enrichment Details</DialogTitle>
        </DialogHeader>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-8">
            {/* Profile Header */}
            <div className="flex items-start gap-6 mb-8">
              {(() => {
                const initials = displayName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()

                const profileImageUrl =
                  enrichedData?.profile_pic_url ||
                  enrichedData?.profile_image ||
                  enrichedData?.profile_picture ||
                  enrichedData?.image_url ||
                  enrichedData?.photo_url ||
                  enrichedData?.picture ||
                  enrichedData?.avatar ||
                  enrichedData?.photo

                return (
                  <div className="relative">
                    {/* Always show initials avatar as base */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {initials}
                    </div>

                    {/* Show profile image on top if available */}
                    {profileImageUrl && (
                      <img
                        src={profileImageUrl || "/placeholder.svg"}
                        alt="Profile"
                        className="absolute top-0 left-0 w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        onLoad={() => {
                          console.log("✅ Profile image loaded successfully:", profileImageUrl)
                        }}
                        onError={(e) => {
                          console.error("❌ Profile image failed to load:", profileImageUrl)
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    )}
                  </div>
                )
              })()}

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{displayName}</h2>
                    <p className="text-lg text-gray-600 mb-2">
                      {enrichedData?.headline || enrichedData?.occupation || contact?.job_title || "Professional"}
                    </p>

                    {enrichedData?.public_identifier && (
                      <a
                        href={`https://www.linkedin.com/in/${enrichedData.public_identifier}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center mb-2"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View LinkedIn Profile
                      </a>
                    )}

                    {(enrichedData?.city || enrichedData?.state || enrichedData?.country) && (
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {[
                          enrichedData?.city,
                          enrichedData?.state,
                          enrichedData?.country_full_name || enrichedData?.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* LinkedIn and follower info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  {enrichedData?.follower_count && (
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {enrichedData.follower_count.toLocaleString()} followers
                    </span>
                  )}
                  {enrichedData?.connections && (
                    <span className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      {enrichedData.connections.toLocaleString()} connections
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - only show if not in approval mode */}
            {!isApprovalMode && (
              <div className="flex flex-wrap gap-3 mb-6">
                {onEnrichProfile && (
                  <Button
                    variant="outline"
                    className="border-2 border-blue-200 hover:bg-blue-50"
                    onClick={onEnrichProfile}
                    disabled={enriching}
                  >
                    {enriching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enriching...
                      </>
                    ) : (
                      "Re-enrich Profile"
                    )}
                  </Button>
                )}

                {onGenerateAISummary && (
                  <Button
                    variant="outline"
                    className="border-2 border-purple-200 hover:bg-purple-50"
                    onClick={onGenerateAISummary}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate AI Summary"
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Tab Navigation */}
            {setActiveTab && (
              <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                        activeTab === tab.id
                          ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Tab Content */}
            <div className="min-h-[300px]">{renderTabContent()}</div>

            {/* AI Summary */}
            {aiSummary && (
              <div className="bg-purple-50 p-6 rounded-xl mt-6">
                <h3 className="font-semibold text-purple-800 mb-3">AI-Generated Summary</h3>
                <div className="text-purple-800 leading-relaxed whitespace-pre-line">{aiSummary}</div>
              </div>
            )}

            {/* Raw Data Debug (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Debug: Raw Enrichment Data ({Object.keys(enrichedData || {}).length} fields)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-x-auto max-h-40">
                    {JSON.stringify(enrichedData, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Approval Buttons - only show in approval mode */}
            {isApprovalMode && (
              <div className="flex justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onReject}
                  disabled={approving}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={onApprove} disabled={approving} className="bg-green-600 hover:bg-green-700 text-white">
                  {approving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  {approving ? "Saving..." : "Accept & Save"}
                </Button>
              </div>
            )}

            {/* Close Button - only show if not in approval mode */}
            {!isApprovalMode && (
              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button onClick={() => onOpenChange?.(false)}>Close</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
