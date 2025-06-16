"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Linkedin,
  Globe,
  Mail,
  Building,
  GraduationCap,
  User,
  Briefcase,
  Calendar,
  Star,
  Award,
  Users,
} from "lucide-react"

interface EnrichmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: {
    contact: any
    enrichmentData: any
  } | null
}

export function EnrichmentModal({ open, onOpenChange, data }: EnrichmentModalProps) {
  console.log("EnrichmentModal rendered with open:", open)
  console.log("EnrichmentModal data:", data)

  if (!data) {
    console.log("No data provided to EnrichmentModal")
    return null
  }

  const { contact, enrichmentData } = data
  console.log("Contact data:", contact)
  console.log("Enrichment data:", enrichmentData)

  // Helper function to render any object/array data
  const renderDataSection = (title: string, data: any, icon?: any) => {
    // Check if data is null, undefined, empty array, or empty object
    if (
      !data ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === "object" && data !== null && Object.keys(data).length === 0)
    ) {
      return null
    }

    const IconComponent = icon || User

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(data) ? (
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  {typeof item === "object" && item !== null ? (
                    <div className="space-y-2">
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                          <span className="text-sm text-gray-600">
                            {value === null ? "N/A" : typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm">{item === null ? "N/A" : String(item)}</span>
                  )}
                </div>
              ))}
            </div>
          ) : typeof data === "object" && data !== null ? (
            <div className="space-y-2">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between items-start">
                  <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                  <span className="text-sm text-gray-600 text-right max-w-xs">
                    {value === null
                      ? "N/A"
                      : typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm">{data === null ? "N/A" : String(data)}</span>
          )}
        </CardContent>
      </Card>
    )
  }

  // Get all the enrichment data keys
  const enrichmentKeys = enrichmentData ? Object.keys(enrichmentData) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={enrichmentData?.profile_picture || enrichmentData?.photo || "/placeholder.svg"} />
              <AvatarFallback>
                {contact.first_name?.[0]}
                {contact.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {enrichmentData?.full_name || contact.full_name || `${contact.first_name} ${contact.last_name}`}
              </h2>
              <p className="text-sm text-gray-600">{contact.email}</p>
              {enrichmentData?.current_title && <p className="text-sm text-blue-600">{enrichmentData.current_title}</p>}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Show raw enrichment data for debugging */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Raw Enrichment Data ({enrichmentKeys.length} fields):</h3>
          <pre className="text-xs text-yellow-700 overflow-x-auto">{JSON.stringify(enrichmentData, null, 2)}</pre>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Personal Information */}
          {(enrichmentData?.first_name || enrichmentData?.last_name || enrichmentData?.full_name) &&
            renderDataSection(
              "Personal Information",
              {
                first_name: enrichmentData?.first_name,
                last_name: enrichmentData?.last_name,
                full_name: enrichmentData?.full_name,
                gender: enrichmentData?.gender,
                birth_date: enrichmentData?.birth_date,
                age: enrichmentData?.age,
              },
              User,
            )}

          {/* Contact Information */}
          {(enrichmentData?.emails || enrichmentData?.phone_numbers || enrichmentData?.additional_emails) &&
            renderDataSection(
              "Contact Information",
              {
                emails: enrichmentData?.emails,
                additional_emails: enrichmentData?.additional_emails,
                phone_numbers: enrichmentData?.phone_numbers,
                mobile_phone: enrichmentData?.mobile_phone,
                location: enrichmentData?.location,
                address: enrichmentData?.address,
                city: enrichmentData?.city,
                state: enrichmentData?.state,
                country: enrichmentData?.country,
              },
              Mail,
            )}

          {/* Current Position */}
          {(enrichmentData?.current_title || enrichmentData?.current_company) &&
            renderDataSection(
              "Current Position",
              {
                title: enrichmentData?.current_title,
                company: enrichmentData?.current_company,
                industry: enrichmentData?.industry,
                seniority: enrichmentData?.seniority,
                department: enrichmentData?.department,
                start_date: enrichmentData?.start_date,
              },
              Briefcase,
            )}

          {/* Company Information */}
          {enrichmentData?.company_info &&
            renderDataSection("Company Information", enrichmentData.company_info, Building)}

          {/* Work Experience */}
          {enrichmentData?.work_experience &&
            renderDataSection("Work Experience", enrichmentData.work_experience, Briefcase)}

          {/* Job History */}
          {enrichmentData?.job_history && renderDataSection("Job History", enrichmentData.job_history, Calendar)}

          {/* Education */}
          {enrichmentData?.education && renderDataSection("Education", enrichmentData.education, GraduationCap)}

          {/* Skills */}
          {enrichmentData?.skills && renderDataSection("Skills", enrichmentData.skills, Star)}

          {/* Certifications */}
          {enrichmentData?.certifications && renderDataSection("Certifications", enrichmentData.certifications, Award)}

          {/* Social Profiles */}
          {enrichmentData?.social_profiles &&
            renderDataSection("Social Profiles", enrichmentData.social_profiles, Users)}

          {/* LinkedIn Data */}
          {(enrichmentData?.linkedin_url || enrichmentData?.linkedin_profile) &&
            renderDataSection(
              "LinkedIn Information",
              {
                linkedin_url: enrichmentData?.linkedin_url,
                linkedin_profile: enrichmentData?.linkedin_profile,
                linkedin_connections: enrichmentData?.linkedin_connections,
              },
              Linkedin,
            )}

          {/* Additional Data - Show any remaining fields */}
          {enrichmentKeys
            .filter(
              (key) =>
                ![
                  "first_name",
                  "last_name",
                  "full_name",
                  "gender",
                  "birth_date",
                  "age",
                  "emails",
                  "additional_emails",
                  "phone_numbers",
                  "mobile_phone",
                  "location",
                  "address",
                  "city",
                  "state",
                  "country",
                  "current_title",
                  "current_company",
                  "industry",
                  "seniority",
                  "department",
                  "start_date",
                  "company_info",
                  "work_experience",
                  "job_history",
                  "education",
                  "skills",
                  "certifications",
                  "social_profiles",
                  "linkedin_url",
                  "linkedin_profile",
                  "linkedin_connections",
                  "profile_picture",
                  "photo",
                ].includes(key),
            )
            .map((key) =>
              renderDataSection(
                `${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`,
                enrichmentData[key],
                Globe,
              ),
            )}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">Total enrichment fields: {enrichmentKeys.length}</div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
