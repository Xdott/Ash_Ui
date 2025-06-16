"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import {
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  Shield,
  Upload,
  FileText,
  Download,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ValidationResult {
  email: string
  smtp_check: boolean | null
  confidence: number | null
  status: string
  source: string
  result?: {
    data: {
      email: string
      score: number
      smtp_check: boolean
      status: string
      result: string
      mx_records: boolean
      accept_all: boolean
      // Other fields
    }
  }
  error?: string
}

interface BulkValidationResponse {
  success: boolean
  message: string
  summary: {
    total_emails_in_file: number
    valid_email_format: number
    invalid_email_format: number
    processed: number
    successful_validations: number
    failed_validations: number
    cached_results: number
    skipped_due_to_limit: number
    remaining_limit: number
    user_limit: number
  }
  results: ValidationResult[]
  warning?: string
  invalid_emails_sample?: string[]
}

export function EmailFinder() {
  const [mode, setMode] = useState<"single" | "bulk">("single")
  const [email, setEmail] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [singleResult, setSingleResult] = useState<any>(null)
  const [bulkResults, setBulkResults] = useState<BulkValidationResponse | null>(null)
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated } = useAuth0()
  const { toast } = useToast()

  // Fix hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const findEmail = async () => {
    if (!email) {
      toast({
        title: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setSingleResult(null)
    try {
      if (!isAuthenticated || !user?.email) {
        setSingleResult({ error: "User not authenticated" })
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/email-finder?email=${encodeURIComponent(user.email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.status === 403) {
        const data = await response.json()
        setSingleResult({ error: data?.error || "Limit reached. Contact Admin" })
      } else if (response.status >= 400) {
        setSingleResult({ error: "Validation failed" })
      } else {
        const data = await response.json()
        setSingleResult(data)
      }
    } catch (err) {
      console.error("Email validation failed:", err)
      setSingleResult({ error: "Unexpected error occurred" })
    }
    setLoading(false)
  }

  const validateBulkEmails = async () => {
    if (!file) {
      toast({
        title: "Please select a file",
        variant: "destructive",
      })
      return
    }

    if (!API_URL) {
      toast({
        title: "Configuration Error",
        description: "API URL is not configured.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setBulkResults(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_URL}/bulk-email-finder?email=${encodeURIComponent(user.email!)}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: BulkValidationResponse = await response.json()

      // Process the data to extract nested values
      const processedData = {
        ...data,
        results: data.results.map((result) => ({
          ...result,
          // Extract SMTP check from nested result.data if available
          smtp_check: result.result?.data?.smtp_check ?? result.smtp_check,
          // Extract confidence/score from nested result.data if available
          confidence: result.result?.data?.score ?? result.confidence,
        })),
      }

      setBulkResults(processedData)

      toast({
        title: "Bulk validation completed",
        description: `Processed ${data.summary.processed} emails successfully`,
      })

      if (data.warning) {
        toast({
          title: "Warning",
          description: data.warning,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Bulk validation error:", error)
      toast({
        title: "Bulk validation failed",
        description: error.message,
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const downloadResults = () => {
    if (!bulkResults) return

    const csvContent = [
      ["Email", "SMTP Check", "Confidence", "Status", "Error"].join(","),
      ...bulkResults.results.map((result) => {
        // Get SMTP check from nested data if available
        const smtpCheck = result.result?.data?.smtp_check ?? result.smtp_check ?? false
        // Get confidence/score from nested data if available
        const confidence = result.result?.data?.score ?? result.confidence ?? 0

        return [result.email, smtpCheck, confidence, result.status, result.error || ""].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `email-finder-results-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV, XLS, or XLSX file",
          variant: "destructive",
        })
      }
    }
  }

  // Calculate score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  // Get background color for score circle
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 50) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Email Finder</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Verify email addresses with detailed deliverability analysis and confidence scoring - single emails or
              bulk validation
            </p>
          </div>

      
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              <button
                onClick={() => setMode("single")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  mode === "single"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Single Email
              </button>
              <button
                onClick={() => setMode("bulk")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  mode === "bulk"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Bulk Upload
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <Card className="lg:col-span-1 shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-8">
                {mode === "single" ? (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-lg py-4 border-2 focus:border-purple-500"
                        onKeyPress={(e) => e.key === "Enter" && findEmail()}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Enter any email address to check its validity and deliverability
                      </p>
                    </div>
                    <Button
                      className="w-full py-4 text-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                      onClick={findEmail}
                      disabled={loading || !email}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5" />
                          Validate Email
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-3">
                        <Upload className="h-5 w-5 text-purple-600 mr-3" />
                        <label htmlFor="file" className="font-semibold text-gray-700">
                          Upload File
                        </label>
                        <span className="ml-2 text-xs text-red-500">*</span>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                        <input
                          id="file"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="file" className="cursor-pointer">
                          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            {file ? file.name : "Click to upload CSV, XLS, or XLSX"}
                          </p>
                          <p className="text-xs text-gray-500">Must contain an 'email' column</p>
                        </label>
                      </div>
                    </div>

                    <Button
                      onClick={validateBulkEmails}
                      disabled={loading || !file}
                      className="w-full py-4 text-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Validate Bulk Emails
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="lg:col-span-2">
              {loading ? (
                <Card className="shadow-xl border-0 bg-blue-50 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
                    <h3 className="text-xl font-semibold mb-2 text-blue-800">
                      {mode === "single" ? "Validating Email..." : "Processing Bulk Validation..."}
                    </h3>
                    <p className="text-blue-600">
                      {mode === "single"
                        ? "Please wait while we validate your email address."
                        : "This may take a few minutes depending on file size."}
                    </p>
                  </CardContent>
                </Card>
              ) : mode === "single" && singleResult && !singleResult.error ? (
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {singleResult.result?.data?.email || email}
                        </h2>
                        <div className="flex items-center mt-1">
                          {singleResult.result?.data?.result === "deliverable" ? (
                            <>
                              <Badge className="px-3 py-1 bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" /> Valid email
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Badge variant="destructive" className="px-3 py-1">
                                <XCircle className="h-3 w-3 mr-1" /> Invalid or undeliverable
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>

                      {singleResult.result?.data?.score !== undefined && (
                        <div className="text-center">
                          <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBgColor(
                              singleResult.result.data.score,
                            )}`}
                          >
                            <span className={`text-2xl font-bold ${getScoreColor(singleResult.result.data.score)}`}>
                              {singleResult.result.data.score}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Confidence Score</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
                        <p className="text-sm font-semibold text-gray-500 mb-2">SMTP Check</p>
                        <div className="flex items-center">
                          {singleResult.result?.data?.smtp_check ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span className="font-medium">
                            {singleResult.result?.data?.smtp_check ? "Passed" : "Failed"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
                        <p className="text-sm font-semibold text-gray-500 mb-2">MX Records</p>
                        <div className="flex items-center">
                          {singleResult.result?.data?.mx_records ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                          )}
                          <span className="font-medium">
                            {singleResult.result?.data?.mx_records ? "Valid" : "Invalid"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
                        <p className="text-sm font-semibold text-gray-500 mb-2">Accept All</p>
                        <div className="flex items-center">
                          {singleResult.result?.data?.accept_all ? (
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          )}
                          <span className="font-medium">{singleResult.result?.data?.accept_all ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl mb-6">
                      <h3 className="font-semibold text-gray-700 mb-3">Validation Summary</h3>
                      <p className="text-gray-600">
                        {singleResult.result?.data?.result === "deliverable"
                          ? "This email address is valid and can receive messages. The domain has proper mail server configuration and the mailbox exists."
                          : "This email address may not be deliverable. There could be issues with the domain's mail server configuration or the mailbox might not exist."}
                      </p>
                    </div>

                    {singleResult.result?.data?.sources?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-3">Found in these sources:</h3>
                        <div className="flex flex-wrap gap-2">
                          {singleResult.result.data.sources.map((source: any, index: number) => (
                            <a
                              key={index}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full text-purple-700"
                            >
                              {source.domain}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : mode === "bulk" && bulkResults ? (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2">Bulk Validation Summary</h2>
                          <p className="text-gray-600">{bulkResults.message}</p>
                        </div>
                        <Button onClick={downloadResults} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download CSV
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">{bulkResults.summary.processed}</p>
                          <p className="text-sm text-blue-800">Processed</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {bulkResults.summary.successful_validations}
                          </p>
                          <p className="text-sm text-green-800">Successful</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-red-600">{bulkResults.summary.failed_validations}</p>
                          <p className="text-sm text-red-800">Failed</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600">{bulkResults.summary.remaining_limit}</p>
                          <p className="text-sm text-purple-800">Remaining</p>
                        </div>
                      </div>

                      {bulkResults.warning && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                            <p className="text-yellow-800">{bulkResults.warning}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Results Table */}
                  <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Email</th>
                              <th className="text-left p-2">Status</th>
                              <th className="text-left p-2">SMTP Check</th>
                              <th className="text-left p-2">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkResults.results.slice(0, 50).map((result, index) => {
                              // Get SMTP check from nested data if available
                              const smtpCheck = result.result?.data?.smtp_check ?? result.smtp_check ?? false
                              // Get confidence/score from nested data if available
                              const confidence = result.result?.data?.score ?? result.confidence ?? 0

                              return (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                  <td className="p-2 font-mono text-xs">{result.email}</td>
                                  <td className="p-2">
                                    <Badge
                                      variant={result.status === "success" ? "default" : "destructive"}
                                      className="text-xs"
                                    >
                                      {result.status}
                                    </Badge>
                                  </td>
                                  <td className="p-2">
                                    {smtpCheck ? (
                                      <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                        <span className="text-green-600 text-xs">Passed</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <XCircle className="h-4 w-4 text-red-600 mr-1" />
                                        <span className="text-red-600 text-xs">Failed</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-2">
                                    <span
                                      className={`text-xs px-2 py-1 rounded ${
                                        confidence >= 80
                                          ? "bg-green-100 text-green-800"
                                          : confidence >= 60
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {confidence || "N/A"}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                        {bulkResults.results.length > 50 && (
                          <p className="text-center text-gray-500 mt-4">
                            Showing first 50 results. Download CSV for complete data.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : singleResult?.error || bulkResults?.error ? (
                <Card className="shadow-xl border-0 bg-red-50/80 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-3 rounded-full mr-4">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-red-800 mb-1">Validation Error</h2>
                        <p className="text-red-700">{singleResult?.error || bulkResults?.error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-xl border-0 bg-white/50 backdrop-blur h-full">
                  <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="text-center text-gray-500 max-w-md">
                      <div className="bg-purple-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Mail className="h-12 w-12 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-700">
                        {mode === "single" ? "Validate Any Email Address" : "Bulk Email Validation"}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {mode === "single"
                          ? "Enter an email address to check if it's valid and deliverable. Our system will verify the domain, mail server configuration, and mailbox existence."
                          : "Upload a CSV, XLS, or XLSX file with an 'email' column to validate multiple addresses at once with detailed confidence scoring."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Validation</h3>
              <p className="text-sm text-gray-600">SMTP check, MX records, and deliverability analysis</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Bulk Processing</h3>
              <p className="text-sm text-gray-600">Upload CSV files and validate thousands of emails</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center">
              <Shield className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Confidence Scoring</h3>
              <p className="text-sm text-gray-600">Get detailed confidence scores for each validation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
