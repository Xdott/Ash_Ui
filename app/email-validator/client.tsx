"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Mail, Upload, FileText, Download, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

// Make sure this is correctly set in your .env file
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

export default function EmailValidatorPage() {
  const [mode, setMode] = useState<"single" | "bulk">("single")
  const [email, setEmail] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [singleResult, setSingleResult] = useState<any>(null)
  const [bulkResults, setBulkResults] = useState<BulkValidationResponse | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0()

  // Fix hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="mb-4">You need to be logged in to use the Email Validator.</p>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  const validateSingleEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Please enter an email address",
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
    setSingleResult(null)

    try {
      const response = await fetch(`${API_URL}/validate_email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          user_email: user.email,
        }),
      })

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("Non-JSON response:", textResponse)
        throw new Error("Server returned non-JSON response. Check API endpoint.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSingleResult(data)

      toast({
        title: "Email validation completed",
        description: `Email ${data.valid ? "is valid" : "is invalid"}`,
      })
    } catch (error: any) {
      console.error("Email validation error:", error)
      toast({
        title: "Validation failed",
        description: error.message,
        variant: "destructive",
      })
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
      // Create a new FormData instance
      const formData = new FormData()

      // Append the file with the correct field name
      formData.append("file", file)

      // Construct the URL with the user email as a query parameter
      const requestUrl = `${API_URL}/bulk-email-finder?email=${encodeURIComponent(user.email || "")}`

      console.log("Making request to:", requestUrl)
      console.log("File name:", file.name)
      console.log("File size:", file.size)
      console.log("File type:", file.type)

      // Make the fetch request
      const response = await fetch(requestUrl, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header when using FormData
        // The browser will automatically set it with the correct boundary
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        if (response.headers.get("content-type")?.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        } else {
          const textError = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${textError.substring(0, 100)}`)
        }
      }

      const data: BulkValidationResponse = await response.json()
      console.log("Response data received:", data)

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

      // Provide a more helpful error message
      let errorMessage = "Failed to validate emails"

      if (error.message) {
        errorMessage = error.message
      }

      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        errorMessage = `Network error: Cannot connect to the API server. Please check your API URL configuration (${API_URL || "not set"}).`
      }

      toast({
        title: "Bulk validation failed",
        description: errorMessage,
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
    a.download = `email-validation-results-${new Date().toISOString().split("T")[0]}.csv`
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

  // Helper function to get SMTP check value from result
  const getSmtpCheck = (result: ValidationResult): boolean => {
    return result.result?.data?.smtp_check ?? result.smtp_check ?? false
  }

  // Helper function to get confidence/score value from result
  const getConfidence = (result: ValidationResult): number => {
    return result.result?.data?.score ?? result.confidence ?? 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
              <Mail className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Email Validator</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Verify email addresses for deliverability and accuracy - single emails or bulk validation
            </p>
          </div>

          {/* Debug Info - Remove in production */}
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> API_URL = {API_URL || "Not set"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              <button
                onClick={() => setMode("single")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  mode === "single"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Single Email
              </button>
              <button
                onClick={() => setMode("bulk")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  mode === "bulk"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Bulk Upload
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <Card className="lg:col-span-1 shadow-xl border-0 bg-white/90 backdrop-blur">
              <CardContent className="p-6">
                {mode === "single" ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-3">
                        <Mail className="h-5 w-5 text-red-600 mr-3" />
                        <label htmlFor="email" className="font-semibold text-gray-700">
                          Email Address
                        </label>
                        <span className="ml-2 text-xs text-red-500">*</span>
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="py-3 text-base border-2 focus:border-red-500"
                        onKeyPress={(e) => e.key === "Enter" && validateSingleEmail()}
                      />
                    </div>

                    <Button
                      onClick={validateSingleEmail}
                      disabled={loading || !email.trim()}
                      className="w-full py-3 text-base bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Validate Email
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-3">
                        <Upload className="h-5 w-5 text-red-600 mr-3" />
                        <label htmlFor="file" className="font-semibold text-gray-700">
                          Upload File
                        </label>
                        <span className="ml-2 text-xs text-red-500">*</span>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
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
                      className="w-full py-3 text-base bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
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
              ) : mode === "single" && singleResult ? (
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Validation Results</h2>
                        <p className="text-gray-600">Analysis for {singleResult.email || email}</p>
                      </div>
                      <Badge
                        variant={singleResult.valid ? "default" : "destructive"}
                        className={`text-sm px-3 py-1 ${
                          singleResult.valid
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {singleResult.valid ? "Valid" : "Invalid"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Mail className="h-4 w-4 text-gray-600 mr-2" />
                          <p className="text-sm font-semibold text-gray-700">Email Address</p>
                        </div>
                        <p className="text-base font-bold text-gray-900 break-all">{singleResult.email || email}</p>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-4 w-4 text-gray-600 mr-2" />
                          <p className="text-sm font-semibold text-gray-700">Deliverable</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{singleResult.deliverable ? "Yes" : "No"}</p>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="h-4 w-4 text-gray-600 mr-2" />
                          <p className="text-sm font-semibold text-gray-700">Score</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{singleResult.score || "N/A"}</p>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <XCircle className="h-4 w-4 text-gray-600 mr-2" />
                          <p className="text-sm font-semibold text-gray-700">Disposable</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{singleResult.disposable ? "Yes" : "No"}</p>
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-xl ${
                        singleResult.valid
                          ? "bg-gradient-to-r from-green-50 to-emerald-50"
                          : "bg-gradient-to-r from-red-50 to-pink-50"
                      }`}
                    >
                      <div className="flex items-start">
                        {singleResult.valid ? (
                          <>
                            <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-green-800 mb-1">Valid Email Address</h3>
                              <p className="text-green-700 text-sm">
                                This email address is valid and can receive messages.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0">
                              <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-red-800 mb-1">Invalid Email Address</h3>
                              <p className="text-red-700 text-sm">
                                This email address is invalid or cannot receive messages.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
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
              ) : (
                <Card className="shadow-xl border-0 bg-white/50 backdrop-blur">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center text-gray-500 max-w-md">
                      <div className="bg-red-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Mail className="h-12 w-12 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-700">Ready to Validate</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {mode === "single"
                          ? "Enter an email address to verify its deliverability and get detailed validation results."
                          : "Upload a CSV, XLS, or XLSX file with an 'email' column to validate multiple addresses at once."}
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
              <h3 className="font-semibold text-gray-900 mb-2">Syntax Check</h3>
              <p className="text-sm text-gray-600">Verify email format and syntax</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Domain Validation</h3>
              <p className="text-sm text-gray-600">Check if domain exists and accepts mail</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Deliverability</h3>
              <p className="text-sm text-gray-600">Test if email can receive messages</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
