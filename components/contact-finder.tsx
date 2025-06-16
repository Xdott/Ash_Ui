{/* Action Buttons */}
<div className="flex flex-wrap gap-3 mb-6">
{/* 🔥 ALWAYS show Enrich Profile button - no validation */}
<button
  className="px-6 py-3 border-2 border-blue-200 hover:bg-blue-50 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center"
  onClick={handleEnrichProfile}
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
  onClick={handleGenerateAISummary}
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
</button>
</div>  const handleEnrichProfile = async () => {
// Fix: Use the correct field name from your backend response
const linkedinUrl =
result.person_info?.LinkedIn_Profile || // Backend returns this (uppercase)
result.person_info?.linkedin_profile // Fallback (lowercase)

console.log("🔍 Attempting to enrich profile...")
console.log("LinkedIn URL from result:", linkedinUrl)

setEnriching(true)
setError(null)

try {
const response = await fetch(`${API_URL}/api/enrich_profile`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
linkedin_url: linkedinUrl || "https://www.linkedin.com/in/test",
}),
})

console.log("📡 Enrichment response status:", response.status)
console.log("📡 Response headers:", response.headers)

if (!response.ok) {
const errorText = await response.text()
console.error("❌ Enrichment failed with status:", response.status)
console.error("❌ Error response:", errorText)
throw new Error(`HTTP error! status: ${response.status}: ${errorText}`)
}

const enrichedProfile = await response.json()
console.log("✅ Enriched profile response:", enrichedProfile)

// Transform the API response to match our UI expectations
const transformedData = {
profile_image: enrichedProfile.profile_pic_url,
full_name: enrichedProfile.full_name,
headline: enrichedProfile.headline,
location:
`${enrichedProfile.city || ""}${enrichedProfile.city && enrichedProfile.country_full_name ? ", " : ""}${enrichedProfile.country_full_name || ""}`.trim(),

social_profiles: {
linkedin: linkedinUrl, // Use the correct LinkedIn URL
...(enrichedProfile.personal_emails &&
enrichedProfile.personal_emails.length > 0 && {
email: enrichedProfile.personal_emails[0],
}),
...(enrichedProfile.personal_numbers &&
enrichedProfile.personal_numbers.length > 0 && {
phone: enrichedProfile.personal_numbers[0],
}),
},

company_info:
enrichedProfile.experiences && enrichedProfile.experiences.length > 0
? {
company: enrichedProfile.experiences[0].company,
title: enrichedProfile.experiences[0].title,
description: enrichedProfile.experiences[0].description,
location: enrichedProfile.experiences[0].location,
starts_at: enrichedProfile.experiences[0].starts_at,
ends_at: enrichedProfile.experiences[0].ends_at,
}
: null,

education: enrichedProfile.education?.slice(0, 2).map((edu: any) => ({
school: edu.school,
degree: edu.degree_name,
field: edu.field_of_study,
starts_at: edu.starts_at,
ends_at: edu.ends_at,
})),

skills: enrichedProfile.skills || [],
summary: enrichedProfile.summary,
follower_count: enrichedProfile.follower_count,
connections: enrichedProfile.connections,
raw_data: enrichedProfile,
}

console.log("🎯 Transformed enrichment data:", transformedData)
setEnrichedData(transformedData)
} catch (error: any) {
console.error("💥 Enrichment failed:", error)
setError(`Failed to enrich profile: ${error.message}`)
}

setEnriching(false)
}

const handleGenerateAISummary = async () => {
setGenerating(true)

try {
const response = await fetch(`${API_URL}/api/generate_summary`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
contact_data: result,
enriched_data: enrichedData,
}),
})

if (!response.ok) {
const errorText = await response.text()
throw new Error(`HTTP error! status: ${response.status}: ${errorText}`)
}

const data = await response.json()
console.log("AI summary response:", data)
setAiSummary(data.summary)
} catch (error: any) {
console.error("AI summary generation failed:", error)
setError(`Failed to generate AI summary: ${error.message}`)
}

setGenerating(false)
}"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { User, Building, MapPin, Briefcase, Search, Loader2, ArrowLeft, ExternalLink, Globe, Mail } from "lucide-react"
import { useAuth0 } from "@auth0/auth0-react"
import debounce from "lodash.debounce"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

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
const [activeTab, setActiveTab] = useState("overview")

const { user, error: authError, isLoading: authLoading, loginWithRedirect } = useAuth0()

const [companySuggestions, setCompanySuggestions] = useState([])
const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)
const [disableCompanySuggestions, setDisableCompanySuggestions] = useState(false)
const companyInputRef = useRef<HTMLInputElement>(null)

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
if (companyInputRef.current && !companyInputRef.current.contains(event.target as Node)) {
setShowCompanySuggestions(false)
}
}

document.addEventListener("mousedown", handleClickOutside)
return () => {
document.removeEventListener("mousedown", handleClickOutside)
}
}, [])

useEffect(() => {
if (employeeDetails.companyName === "") {
setDisableCompanySuggestions(false)
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
if (!domain) return domain;

let name = domain.replace('www.', '').split('.')[0];
name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
name = name.replace(/([a-z])(youth|ranch|inc|llc|corp|solutions|creative|realty|company|tech|soft|ware|group|media|design|studio)/gi, '$1 $2');

name = name.split(' ').map(word =>
word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
).join(' ');

if (!name.match(/(Inc|LLC|Corp|Company|Group|Solutions)$/i)) {
name += ' Inc';
}

return name;
};

const handleCompanySuggestionClick = (companyName: string) => {
setEmployeeDetails({ ...employeeDetails, companyName })
setCompanySuggestions([])
setShowCompanySuggestions(false)
setDisableCompanySuggestions(true)
if (companyInputRef.current) {
companyInputRef.current.focus()
}
}

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()
setDisableCompanySuggestions(true)
setCompanySuggestions([])
setShowCompanySuggestions(false)
setLoading(true)
setEnrichedData(null)
setAiSummary("")
setError(null)
setResult(null)

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

// Map frontend fields to backend expected fields
const requestBody = {
employee_name: employeeDetails.employeeName.trim(),
company_name: employeeDetails.companyName.trim(),
location: employeeDetails.location.trim() || "",
title: employeeDetails.title.trim() || "",
email: "", // Employee email field as per your backend
}

const apiUrl = `${API_URL}/validate_employee?email=${encodeURIComponent(userEmail)}`

console.log("=== API CALL ===")
console.log("URL:", apiUrl)
console.log("Request Body:", requestBody)

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
console.log("API Response:", data)

if (data.error) {
throw new Error(data.error)
}

setResult(data)

// Add this debug logging
console.log("=== LINKEDIN DEBUG ===")
console.log("Full result:", data)
console.log("person_info:", data?.person_info)
console.log("linkedin_profile:", data?.person_info?.linkedin_profile)
console.log("======================")

// Check for LinkedIn URL using the correct field name from backend
const linkedinUrl = data.person_info?.linkedin_profile
if (linkedinUrl && linkedinUrl !== "N/A") {
console.log("LinkedIn URL found:", linkedinUrl)
} else {
console.log("No LinkedIn URL found in response")
}
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

if (!linkedinUrl.trim()) {
setError("Please provide a LinkedIn URL.")
setLoading(false)
return
}

try {
const response = await fetch(`${API_URL}/api/find_contact`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({ linkedinUrl }),
})

if (!response.ok) {
const errorText = await response.text()
throw new Error(`API returned status ${response.status}: ${errorText}`)
}

const data = await response.json()
console.log("LinkedIn API response:", data)

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
className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${searchMode === "name" ? "text-white bg-blue-600" : "text-gray-500 hover:text-gray-700"
}`}
onClick={() => {
setSearchMode("name")
resetForm()
}}
>
Name & Company
</button>
<button
className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${searchMode === "linkedin" ? "text-white bg-blue-600" : "text-gray-500 hover:text-gray-700"
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

    if (!disableCompanySuggestions) {
      fetchCompanySuggestions(value)
    }
  }}
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
  required
  autoComplete="off"
/>

{showCompanySuggestions && companySuggestions.length > 0 && (
  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
    <div className="py-1">
      {companySuggestions.map((suggestion: any, idx) => {
        const displayName = suggestion.company_name.includes('.')
          ? domainToCompanyName(suggestion.company_name)
          : suggestion.company_name;

        return (
          <div
            key={idx}
            className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={() => {
              setEmployeeDetails({ ...employeeDetails, companyName: displayName });
              setCompanySuggestions([]);
              setShowCompanySuggestions(false);
              setDisableCompanySuggestions(true);
              if (companyInputRef.current) {
                companyInputRef.current.focus();
              }
            }}
          >
            <div className="font-medium text-gray-900 text-sm">{displayName}</div>
            <div className="text-xs text-gray-500">{suggestion.domain}</div>
          </div>
        );
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
  Searching & Enriching...
</>
) : (
<>
  <Search className="mr-2 h-5 w-5" />
  Find & Enrich Contact
</>
)}
</button>
</form>
)}
</div>
</div>
</div>

{loading && (
<div className="lg:col-span-2">
<div className="bg-blue-50 backdrop-blur shadow-xl rounded-xl border-0">
<div className="p-8 text-center">
<div className="text-blue-600 mb-4">
<Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
<h3 className="text-xl font-semibold mb-2">Searching for Contact...</h3>
<p>This may take a few minutes. Please wait while we search our databases.</p>
</div>
</div>
</div>
</div>
)}

{/* Results Section */}
<div className="lg:col-span-2">
{error ? (
<div className="bg-red-50 backdrop-blur shadow-xl rounded-xl border-0">
<div className="p-8 text-center">
<div className="text-red-600 mb-4">
<h3 className="text-xl font-semibold mb-2">Search Failed</h3>
<p>{error}</p>
</div>
<button
onClick={() => setError(null)}
className="px-6 py-2 border-2 border-red-200 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
>
Try Again
</button>
</div>
</div>
) : result && Object.keys(result).length > 0 ? (
<div className="bg-white/80 backdrop-blur shadow-xl rounded-xl border-0">
<div className="p-8">
{/* Profile Header */}
<div className="flex items-start gap-6 mb-8">
{result.enriched_data?.profile_image ? (
<img
src={result.enriched_data.profile_image || "/placeholder.svg"}
alt="Profile"
className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
onError={(e) => {
  const target = e.target as HTMLImageElement
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeDetails.employeeName || "Contact")}&background=3B82F6&color=ffffff&size=80`
}}
/>
) : (
<div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
{(employeeDetails.employeeName || "C")
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
    {result.enriched_data?.full_name || employeeDetails.employeeName || "Contact Found"}
  </h2>
  {(() => {
    const linkedinUrl =
      result?.person_info?.linkedin_profile ||
      result?.person_info?.LinkedIn_Profile ||
      result?.person_info?.source ||
      result?.enriched_data?.social_profiles?.linkedin

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
  {result.enriched_data?.location && (
    <p className="text-sm text-gray-500 flex items-center">
      <MapPin className="h-4 w-4 mr-1" />
      {result.enriched_data.location}
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
{result.enriched_data && (
<div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
  {result.enriched_data.follower_count && (
    <span className="flex items-center">
      <User className="h-4 w-4 mr-1" />
      {result.enriched_data.follower_count} followers
    </span>
  )}
  {result.enriched_data.connections && (
    <span className="flex items-center">
      <Globe className="h-4 w-4 mr-1" />
      {result.enriched_data.connections} connections
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
{result.enriched_data?.headline || result.person_info?.title || "Professional"}
</p>
</div>

<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
<p className="text-sm font-semibold text-blue-700 mb-2">Profile Summary</p>
<p className="text-sm text-gray-800 leading-relaxed">
{result.enriched_data?.summary || result.person_info?.snippet || "Professional profile information"}
</p>
</div>
</div>

{/* Enriched Data Section */}
{result.enriched_data && (
<div className="bg-blue-50 p-6 rounded-xl mb-6">
<h3 className="font-semibold text-blue-800 mb-4 flex items-center">
<ExternalLink className="h-5 w-5 mr-2" />
Enriched Profile Data
</h3>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{/* Social Profiles */}
{result.enriched_data.social_profiles && (
  <div>
    <p className="text-sm font-medium text-blue-700 mb-3">Social Profiles & Contact</p>
    <div className="space-y-2">
      {Object.entries(result.enriched_data.social_profiles).map(([platform, url]) => (
        <a
          key={platform}
          href={url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-blue-600 hover:underline transition-colors"
        >
          {platform === "linkedin" && <User className="h-4 w-4 mr-2" />}
          {platform === "email" && <Mail className="h-4 w-4 mr-2" />}
          {platform === "github" && <Globe className="h-4 w-4 mr-2" />}
          <span className="capitalize">{platform}:</span>
          <span className="ml-1 truncate">{url as string}</span>
        </a>
      ))}
    </div>
  </div>
)}

{/* Company Info */}
{result.enriched_data.company_info && (
  <div>
    <p className="text-sm font-medium text-blue-700 mb-3">Current Position</p>
    <div className="space-y-2 text-sm text-blue-800">
      <p>
        <strong>Company:</strong> {result.enriched_data.company_info.company}
      </p>
      <p>
        <strong>Title:</strong> {result.enriched_data.company_info.title}
      </p>
      {result.enriched_data.company_info.location && (
        <p>
          <strong>Location:</strong> {result.enriched_data.company_info.location}
        </p>
      )}
    </div>
  </div>
)}

{/* Education */}
{result.enriched_data.education && result.enriched_data.education.length > 0 && (
  <div>
    <p className="text-sm font-medium text-blue-700 mb-3">Education</p>
    <div className="space-y-2">
      {result.enriched_data.education.map((edu: any, index: number) => (
        <div key={index} className="text-sm text-blue-800">
          <p>
            <strong>{edu.school}</strong>
          </p>
          {edu.degree && <p>{edu.degree}</p>}
          {edu.field && <p className="text-xs text-blue-600">{edu.field}</p>}
        </div>
      ))}
    </div>
  </div>
)}

{/* Skills */}
{result.enriched_data.skills && result.enriched_data.skills.length > 0 && (
  <div className="md:col-span-2">
    <p className="text-sm font-medium text-blue-700 mb-3">Skills & Expertise</p>
    <div className="flex flex-wrap gap-2 mb-2">
      {result.enriched_data.skills.slice(0, 10).map((skill: string, index: number) => (
        <span
          key={index}
          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
        >
          {skill}
        </span>
      ))}
      {result.enriched_data.skills.length > 10 && (
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          +{result.enriched_data.skills.length - 10} more
        </span>
      )}
    </div>
  </div>
)}
</div>
</div>
)}

{/* AI Summary Section */}
{result.ai_summary && (
<div className="bg-purple-50 p-6 rounded-xl mb-6">
<h3 className="font-semibold text-purple-800 mb-3">AI-Generated Summary</h3>
<p className="text-purple-800 leading-relaxed">{result.ai_summary}</p>
</div>
)}
</div>
</div>
) : !loading ? (
<div className="bg-gray-50 backdrop-blur shadow-xl rounded-xl border-0">
<div className="p-8 text-center">
<div className="text-gray-600 mb-4">
<Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
<h3 className="text-xl font-semibold mb-2">Ready to Search</h3>
<p>Enter contact details or LinkedIn URL to find professional information with enriched data.</p>
</div>
</div>
</div>
) : null}
</div>
</div>
</div>
</div>
</div>
)
}