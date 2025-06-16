"use client"

import React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Languages,
  Trophy,
  Building,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react"

interface EnrichmentTabsProps {
  contact: any
  enrichedData: any
}

export function EnrichmentTabs({ contact, enrichedData }: EnrichmentTabsProps) {
  const [activeTab, setActiveTab] = useState("profile")

  const formatDate = (dateObj: any) => {
    if (!dateObj || !dateObj.year) return "N/A"
    const month = dateObj.month || 1
    return new Date(dateObj.year, month - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  }

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Header with Avatar */}
      <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <Avatar className="h-20 w-20">
          <AvatarImage src={enrichedData?.profile_pic_url || "/placeholder.svg"} />
          <AvatarFallback className="text-lg">
            {enrichedData?.first_name?.[0]}
            {enrichedData?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{enrichedData?.full_name || contact?.full_name}</h2>
          <p className="text-lg text-gray-600">{enrichedData?.headline || contact?.job_title}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {[enrichedData?.city, enrichedData?.state, enrichedData?.country_full_name].filter(Boolean).join(", ") ||
                "Location not specified"}
            </span>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-sm">{enrichedData?.full_name || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Industry</label>
            <p className="text-sm">{enrichedData?.industry || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Connections</label>
            <p className="text-sm">{enrichedData?.connections || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Follower Count</label>
            <p className="text-sm">{enrichedData?.follower_count || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      {enrichedData?.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">{enrichedData.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Contact & Social
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contact?.email && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm font-medium">{contact.email}</span>
            </div>
          )}
          {contact?.linkedin_url && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">LinkedIn</span>
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                View Profile <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const ExperienceTab = () => (
    <div className="space-y-4">
      {enrichedData?.experiences && enrichedData.experiences.length > 0 ? (
        enrichedData.experiences.map((exp: any, index: number) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{exp.title || "Position"}</h3>
                  <p className="text-gray-600 font-medium">{exp.company || "Company"}</p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {formatDate(exp.starts_at)}
                      {exp.ends_at ? ` - ${formatDate(exp.ends_at)}` : " - Present"}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                  {exp.description && <p className="mt-3 text-sm text-gray-700 leading-relaxed">{exp.description}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No work experience data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const EducationTab = () => (
    <div className="space-y-4">
      {enrichedData?.education && enrichedData.education.length > 0 ? (
        enrichedData.education.map((edu: any, index: number) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{edu.school || "Institution"}</h3>
                  <p className="text-gray-600 font-medium">{edu.degree_name || "Degree"}</p>
                  {edu.field_of_study && <p className="text-gray-600">{edu.field_of_study}</p>}
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {formatDate(edu.starts_at)}
                      {edu.ends_at ? ` - ${formatDate(edu.ends_at)}` : ""}
                    </span>
                  </div>
                  {edu.description && <p className="mt-3 text-sm text-gray-700 leading-relaxed">{edu.description}</p>}
                  {edu.activities_and_societies && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-500">Activities: </span>
                      <span className="text-xs text-gray-600">{edu.activities_and_societies}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No education data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const SkillsTab = () => {
    // Check for skills from multiple possible sources
    const skills = enrichedData?.skills || []
    const languages = enrichedData?.languages || enrichedData?.languages_and_proficiencies || []
    const interests = enrichedData?.interests || []

    // Extract skills from experience descriptions as fallback
    const extractedSkills = React.useMemo(() => {
      if (skills.length > 0) return []

      const experiences = enrichedData?.experiences || []
      const skillKeywords = new Set()

      experiences.forEach((exp: any) => {
        if (exp.description) {
          const description = exp.description.toLowerCase()
          // Common skill patterns
          const patterns = [
            /\b(javascript|python|java|react|node\.?js|angular|vue|typescript|html|css|sql|mongodb|postgresql|mysql|aws|azure|docker|kubernetes|git|agile|scrum|project management|leadership|team management|strategic planning|business development|marketing|sales|hr|human resources|talent acquisition|recruitment|performance management|employee engagement|diversity|inclusion|dei|posh|grievance handling|policy development|change management|training|development|coaching|mentoring|communication|negotiation|problem solving|analytical|strategic thinking|stakeholder management|process improvement|data analysis|reporting|compliance|risk management|budget management|vendor management|client relationship|customer service|quality assurance|testing|automation|devops|machine learning|ai|artificial intelligence|data science|analytics|digital marketing|seo|sem|social media|content marketing|brand management|product management|ux|ui|design|graphic design|adobe|photoshop|illustrator|figma|sketch|wireframing|prototyping|user research|usability testing|information architecture|interaction design|visual design|typography|color theory|layout design|responsive design|mobile design|web design|front-end|backend|full-stack|database design|api development|microservices|cloud computing|cybersecurity|network security|information security|risk assessment|compliance|audit|governance|finance|accounting|financial analysis|budgeting|forecasting|investment|portfolio management|wealth management|insurance|banking|fintech|blockchain|cryptocurrency|supply chain|logistics|operations|manufacturing|quality control|lean|six sigma|continuous improvement|process optimization|vendor management|procurement|inventory management|warehouse management|distribution|transportation|retail|e-commerce|marketplace|b2b|b2c|crm|erp|salesforce|hubspot|marketo|mailchimp|google analytics|google ads|facebook ads|linkedin ads|twitter ads|instagram ads|youtube ads|tiktok ads|snapchat ads|pinterest ads|email marketing|content creation|copywriting|blogging|journalism|public relations|media relations|crisis communication|event management|conference planning|trade shows|exhibitions|networking|partnership development|alliance management|joint ventures|mergers|acquisitions|due diligence|valuation|investment banking|private equity|venture capital|hedge funds|asset management|real estate|property management|construction|architecture|engineering|civil engineering|mechanical engineering|electrical engineering|software engineering|computer science|information technology|telecommunications|networking|hardware|software|firmware|embedded systems|iot|internet of things|robotics|automation|manufacturing|automotive|aerospace|defense|healthcare|medical devices|pharmaceuticals|biotechnology|life sciences|clinical research|regulatory affairs|quality assurance|medical writing|pharmacovigilance|drug development|clinical trials|medical affairs|health economics|market access|reimbursement|health policy|public health|epidemiology|biostatistics|bioinformatics|genomics|proteomics|metabolomics|systems biology|computational biology|structural biology|molecular biology|cell biology|microbiology|immunology|virology|oncology|cardiology|neurology|psychiatry|psychology|therapy|counseling|social work|education|teaching|training|curriculum development|instructional design|e-learning|lms|learning management systems|educational technology|edtech|student affairs|academic administration|research|grant writing|publication|peer review|conference presentation|workshop facilitation|mentoring|coaching|leadership development|talent management|succession planning|organizational development|change management|culture transformation|employee experience|employer branding|compensation|benefits|payroll|hris|human resources information systems|applicant tracking systems|ats|performance management systems|learning management systems|employee engagement surveys|360 feedback|exit interviews|onboarding|offboarding|workforce planning|diversity and inclusion|equal employment opportunity|affirmative action|labor relations|collective bargaining|union negotiations|grievance procedures|disciplinary actions|terminations|layoffs|restructuring|mergers and acquisitions|due diligence|integration|synergies|cost reduction|revenue growth|market expansion|product launch|go-to-market strategy|competitive analysis|market research|customer insights|user experience|customer journey mapping|persona development|segmentation|targeting|positioning|messaging|value proposition|brand strategy|brand identity|brand guidelines|brand activation|brand monitoring|reputation management|crisis management|stakeholder engagement|investor relations|public affairs|government relations|regulatory compliance|legal affairs|contract negotiation|intellectual property|patents|trademarks|copyrights|licensing|litigation|dispute resolution|mediation|arbitration|compliance|ethics|corporate governance|board relations|executive compensation|risk management|internal audit|external audit|financial reporting|tax|treasury|cash management|working capital|capital allocation|capital structure|debt financing|equity financing|ipo|m&a|strategic planning|business planning|financial planning|scenario planning|sensitivity analysis|monte carlo simulation|financial modeling|valuation|dcf|comparable company analysis|precedent transaction analysis|lbo|leveraged buyout|private equity|venture capital|growth equity|mezzanine|distressed|restructuring|turnaround|bankruptcy|liquidation|asset recovery|collections|credit analysis|underwriting|loan origination|mortgage|commercial lending|consumer lending|credit cards|payments|fintech|digital banking|mobile banking|online banking|wealth management|investment advisory|portfolio management|asset allocation|risk assessment|performance measurement|attribution analysis|alternative investments|hedge funds|real estate|commodities|derivatives|options|futures|swaps|structured products|fixed income|equities|currencies|fx|foreign exchange|trading|market making|sales trading|research|equity research|credit research|macro research|quantitative research|algorithmic trading|high frequency trading|electronic trading|dark pools|market microstructure|regulatory capital|basel|dodd frank|mifid|gdpr|kyc|aml|anti money laundering|sanctions|fatca|crs|tax reporting|transfer pricing|international tax|corporate tax|personal tax|estate planning|trust|fiduciary|insurance|life insurance|health insurance|property insurance|casualty insurance|reinsurance|actuarial|underwriting|claims|risk management|catastrophe modeling|weather derivatives|parametric insurance|insurtech|digital insurance|telematics|usage based insurance|peer to peer insurance|microinsurance|bancassurance|distribution|agency|brokerage|wholesale|retail|direct|online|mobile|omnichannel|customer experience|customer service|call center|contact center|help desk|technical support|field service|installation|maintenance|repair|warranty|spare parts|logistics|supply chain|procurement|sourcing|vendor management|supplier relationship management|contract manufacturing|outsourcing|offshoring|nearshoring|reshoring|inventory management|demand planning|supply planning|production planning|capacity planning|scheduling|lean manufacturing|just in time|kanban|continuous improvement|kaizen|six sigma|total quality management|iso|quality assurance|quality control|testing|inspection|calibration|metrology|standards|certification|compliance|regulatory|environmental|health|safety|sustainability|corporate social responsibility|esg|environmental social governance|carbon footprint|renewable energy|clean technology|green building|leed|energy efficiency|waste reduction|recycling|circular economy|life cycle assessment|environmental impact assessment|social impact|community development|philanthropy|volunteering|nonprofit|ngo|social enterprise|impact investing|microfinance|financial inclusion|digital divide|digital literacy|cybersecurity|information security|data privacy|data protection|encryption|authentication|authorization|identity management|access control|vulnerability assessment|penetration testing|incident response|disaster recovery|business continuity|backup|cloud security|network security|endpoint security|mobile security|application security|web security|email security|social engineering|phishing|malware|ransomware|ddos|firewall|intrusion detection|intrusion prevention|siem|security information event management|threat intelligence|threat hunting|forensics|compliance|audit|governance|risk assessment|security awareness|training|certification|cissp|cism|cisa|crisc|gsec|gcih|gpen|oscp|ceh|security plus|network plus|linux plus|cloud plus|aws certified|azure certified|google cloud certified|cisco certified|microsoft certified|oracle certified|vmware certified|red hat certified|comptia|isaca|isc2|sans|ec council|offensive security|cybrary|coursera|udemy|pluralsight|linkedin learning|skillsoft|cbtnuggets|itpro tv|stormwind studios|global knowledge|new horizons|learning tree|fast lane|exitcertified|koenig solutions|firebrand|qa|qa ltd|marsh|qa training|qa apprenticeships|qa consulting|qa digital|qa higher education)\b/g,
          ]

          patterns.forEach((pattern) => {
            const matches = description.match(pattern)
            if (matches) {
              matches.forEach((match) => skillKeywords.add(match.toLowerCase()))
            }
          })
        }
      })

      return Array.from(skillKeywords).slice(0, 15) // Limit to 15 extracted skills
    }, [enrichedData?.experiences, skills.length])

    const hasAnySkillsData =
      skills.length > 0 || languages.length > 0 || interests.length > 0 || extractedSkills.length > 0

    return (
      <div className="space-y-6">
        {/* Skills */}
        {(skills.length > 0 || extractedSkills.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Skills</span>
                {extractedSkills.length > 0 && skills.length === 0 && (
                  <Badge variant="outline" className="text-xs">
                    Extracted from Experience
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(skills.length > 0 ? skills : extractedSkills).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm capitalize">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="h-5 w-5 mr-2" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {languages.map((language: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {typeof language === "string" ? language : language.name || language.language}
                    {language.proficiency && (
                      <span className="ml-1 text-xs text-gray-500">({language.proficiency})</span>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-sm bg-blue-50 text-blue-700">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professional Areas (derived from experience) */}
        {enrichedData?.experiences && enrichedData.experiences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Professional Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    enrichedData.experiences
                      .map((exp: any) => exp.title)
                      .filter(Boolean)
                      .flatMap((title: string) => {
                        const areas = []
                        const lowerTitle = title.toLowerCase()
                        if (lowerTitle.includes("hr") || lowerTitle.includes("human resource"))
                          areas.push("Human Resources")
                        if (lowerTitle.includes("talent")) areas.push("Talent Management")
                        if (lowerTitle.includes("engagement")) areas.push("Employee Engagement")
                        if (lowerTitle.includes("manager") || lowerTitle.includes("lead")) areas.push("Management")
                        if (lowerTitle.includes("senior") || lowerTitle.includes("specialist"))
                          areas.push("Senior Level")
                        if (lowerTitle.includes("software") || lowerTitle.includes("developer"))
                          areas.push("Software Development")
                        if (lowerTitle.includes("data") || lowerTitle.includes("analyst")) areas.push("Data Analysis")
                        if (lowerTitle.includes("marketing")) areas.push("Marketing")
                        if (lowerTitle.includes("sales")) areas.push("Sales")
                        if (lowerTitle.includes("research")) areas.push("Research")
                        if (lowerTitle.includes("coordinator") || lowerTitle.includes("admin"))
                          areas.push("Administration")
                        return areas
                      }),
                  ),
                )
                  .slice(0, 10)
                  .map((area: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-sm bg-purple-50 text-purple-700">
                      {area}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!hasAnySkillsData && (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="space-y-2">
                <p className="font-medium">No Skills Data Available</p>
                <p className="text-sm">
                  This LinkedIn profile doesn't have publicly visible skills, or they couldn't be extracted by the
                  enrichment service.
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                  <p className="text-sm text-blue-800 font-medium mb-1">Why might this happen?</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Skills section is private on their LinkedIn profile</li>
                    <li>• Profile hasn't been updated with skills</li>
                    <li>• LinkedIn API limitations</li>
                    <li>• Regional restrictions on data access</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const CertificationsTab = () => (
    <div className="space-y-4">
      {enrichedData?.certifications && enrichedData.certifications.length > 0 ? (
        enrichedData.certifications.map((cert: any, index: number) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{cert.name || "Certification"}</h3>
                  {cert.authority && <p className="text-gray-600 font-medium">Issued by: {cert.authority}</p>}
                  {cert.starts_at && (
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(cert.starts_at)}</span>
                      {cert.ends_at && <span> - {formatDate(cert.ends_at)}</span>}
                    </div>
                  )}
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Certificate <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No certifications data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const AccomplishmentsTab = () => (
    <div className="space-y-6">
      {/* Honors & Awards */}
      {enrichedData?.accomplishment_honors_awards && enrichedData.accomplishment_honors_awards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Honors & Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrichedData.accomplishment_honors_awards.map((award: any, index: number) => (
                <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium">{award.title || award}</h4>
                  {award.issuer && <p className="text-sm text-gray-600">Issued by: {award.issuer}</p>}
                  {award.issued_on && <p className="text-xs text-gray-500">{formatDate(award.issued_on)}</p>}
                  {award.description && <p className="text-sm text-gray-700 mt-1">{award.description}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publications */}
      {enrichedData?.accomplishment_publications && enrichedData.accomplishment_publications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Publications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrichedData.accomplishment_publications.map((pub: any, index: number) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium">{pub.name || pub}</h4>
                  {pub.publisher && <p className="text-sm text-gray-600">Publisher: {pub.publisher}</p>}
                  {pub.published_on && <p className="text-xs text-gray-500">{formatDate(pub.published_on)}</p>}
                  {pub.description && <p className="text-sm text-gray-700 mt-1">{pub.description}</p>}
                  {pub.url && (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Publication <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      {enrichedData?.accomplishment_projects && enrichedData.accomplishment_projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrichedData.accomplishment_projects.map((project: any, index: number) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium">{project.title || project}</h4>
                  {project.starts_at && (
                    <p className="text-xs text-gray-500">
                      {formatDate(project.starts_at)}
                      {project.ends_at && ` - ${formatDate(project.ends_at)}`}
                    </p>
                  )}
                  {project.description && <p className="text-sm text-gray-700 mt-1">{project.description}</p>}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Project <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!enrichedData?.accomplishment_honors_awards &&
        !enrichedData?.accomplishment_publications &&
        !enrichedData?.accomplishment_projects && (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No accomplishments data available</p>
            </CardContent>
          </Card>
        )}
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="experience">Experience</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="certifications">Certifications</TabsTrigger>
        <TabsTrigger value="accomplishments">Accomplishments</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <ProfileTab />
      </TabsContent>

      <TabsContent value="experience" className="mt-6">
        <ExperienceTab />
      </TabsContent>

      <TabsContent value="education" className="mt-6">
        <EducationTab />
      </TabsContent>

      <TabsContent value="skills" className="mt-6">
        <SkillsTab />
      </TabsContent>

      <TabsContent value="certifications" className="mt-6">
        <CertificationsTab />
      </TabsContent>

      <TabsContent value="accomplishments" className="mt-6">
        <AccomplishmentsTab />
      </TabsContent>
    </Tabs>
  )
}
