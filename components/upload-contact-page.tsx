"use client"

import type React from "react"
import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  Target,
  TrendingUp,
  CreditCard,
  Zap,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ContactFieldMappingModal from "@/components/ContactFieldMappingModal"

// API base URL - FIXED to match your backend
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/contacts`

interface CreditInfo {
  available_credits: number
  required_credits: number
  remaining_after_upload: number
}

export default function UploadContactPage() {
  const { user, isAuthenticated } = useAuth0()
  const { toast } = useToast()

  // State management
  const [file, setFile] = useState<File | null>(null)
  const [uploadData, setUploadData] = useState<any>(null)
  const [validationSummary, setValidationSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Upload, 2: Mapping, 3: Validation
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null)

  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setFile(files[0])
    }
  }

  // Upload file and get auto-mapping suggestions
  const handleUploadFile = async () => {
    if (!file || !user?.email) {
      toast({
        title: "Error",
        description: "Please select a file and ensure you're logged in",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("email", user.email)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(`${API_BASE_URL}/upload-contacts-file`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Handle credit-specific errors
        if (response.status === 402) {
          toast({
            title: "Insufficient Credits",
            description: `You need ${errorData.required_credits || "more"} credits but only have ${errorData.available_credits || 0} available.`,
            variant: "destructive",
          })
          return
        }

        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      setUploadData(data)
      setCreditInfo(data.credit_info)
      setCurrentStep(2)
      setShowMappingModal(true)

      toast({
        title: "File Uploaded Successfully",
        description: `${data.total_rows} rows detected. ${data.credit_info?.available_credits || 0} credits available.`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  // Confirm mapping and process contacts
  const handleConfirmMapping = async (fieldMappings: Record<string, string>) => {
    if (!uploadData || !user?.email) {
      throw new Error("Missing upload data or user information")
    }

    setLoading(true)
    try {
      // Create the payload with proper structure
      const payload = {
        upload_id: uploadData.upload_id,
        field_mappings: fieldMappings,
        email: user.email,
      }

      console.log("Sending mapping confirmation payload:", JSON.stringify(payload))

      const response = await fetch(`${API_BASE_URL}/confirm-mapping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Mapping confirmation failed")
      }

      const data = await response.json()
      setValidationSummary(data.validation_summary)
      setCurrentStep(3)
      setShowMappingModal(false)

      toast({
        title: "Processing Complete",
        description: `${data.validation_summary.valid_contacts} Valid contacts Processed!`,
      })
    } catch (error) {
      console.error("Mapping error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to process mappings. Please try again."
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Reset to start over
  const handleStartOver = () => {
    setFile(null)
    setUploadData(null)
    setValidationSummary(null)
    setCreditInfo(null)
    setCurrentStep(1)
    setShowMappingModal(false)
  }

  // Render credit information
  const renderCreditInfo = () => {
    if (!creditInfo) return null

    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Credit Information</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-600">{creditInfo.available_credits.toLocaleString()}</div>
                <div className="text-blue-700">Available</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-600">{creditInfo.required_credits.toLocaleString()}</div>
                <div className="text-orange-700">Required</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{creditInfo.remaining_after_upload.toLocaleString()}</div>
                <div className="text-green-700">Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render validation summary statistics
  const renderValidationStats = () => {
    if (!validationSummary) return null

    const stats = [
      {
        label: "Total Rows",
        value: validationSummary.total_rows,
        icon: FileText,
        color: "text-blue-600",
      },
      {
        label: "Valid Contacts",
        value: validationSummary.valid_contacts,
        icon: CheckCircle,
        color: "text-green-600",
      },
      {
        label: "Issues Found",
        value: validationSummary.contacts_with_issues,
        icon: AlertCircle,
        color: "text-orange-600",
      },
      {
        label: "Success Rate",
        value: `${Math.round((validationSummary.valid_contacts / validationSummary.total_rows) * 100)}%`,
        icon: TrendingUp,
        color: "text-purple-600",
      },
    ]

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access the contact upload feature.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            Upload Contacts
          </h1>
          <p className="text-gray-600">
            Import contacts from CSV or Excel files with intelligent field mapping and credit validation
          </p>
        </div>
        <Button onClick={() => (window.location.href = "/upload-history")}>Upload History</Button>
      </div>

      {/* Credit Information */}
      {renderCreditInfo()}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[
            { step: 1, title: "Upload File", icon: Upload },
            { step: 2, title: "Map Fields", icon: Target },
            { step: 3, title: "Review Results", icon: CheckCircle },
          ].map(({ step, title, icon: Icon }, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${currentStep >= step ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"}
              `}
              >
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= step ? "text-blue-600" : "text-gray-400"}`}>
                {title}
              </span>
              {index < 2 && <div className={`ml-4 w-16 h-0.5 ${currentStep > step ? "bg-blue-600" : "bg-gray-300"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: File Upload */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-blue-600" />
              Upload Contact File
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Memory Optimized
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                isDragOver
                  ? "border-blue-400 bg-blue-50 scale-[1.02]"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Upload your contact file</h3>
                  <p className="text-sm text-gray-600">Drag and drop your CSV or Excel file here</p>
                  <p className="text-xs text-gray-500">Maximum file size: 50MB | Maximum records: 30,000</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-blue-600">
                    <Zap className="h-3 w-3" />
                    <span>Processing with credit validation</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv,.xlsx,.xls"
                    className="max-w-xs mx-auto"
                  />
                  {file && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Selected: {file.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Processing file ...</span>
                  <span className="text-blue-600 font-semibold">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleUploadFile}
                disabled={loading || !file}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Upload & Map Fields
                  </>
                )}
              </Button>
            </div>

            {/* File Requirements */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Supported formats:</strong> CSV, XLS, XLSX
                <br />
                <strong>Required field:</strong> Email address
                <br />
                <strong>Recommended fields:</strong> First Name, Last Name, Company
                <br />
                <strong>Credit system:</strong> 1 credit per contact row processed
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Validation Results */}
      {currentStep === 3 && validationSummary && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          {renderValidationStats()}

          {/* Detailed Validation Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Validation Summary
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Processing Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Issues Breakdown */}
              {validationSummary.contacts_with_issues > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Issues Found:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Null Emails", value: validationSummary.null_emails, color: "text-red-600" },
                      { label: "Invalid Emails", value: validationSummary.invalid_emails, color: "text-orange-600" },
                      {
                        label: "Duplicate Emails",
                        value: validationSummary.duplicate_emails,
                        color: "text-yellow-600",
                      },
                      { label: "Missing Names", value: validationSummary.missing_names, color: "text-blue-600" },
                    ].map((issue, index) => (
                      <div key={index} className="text-center">
                        <div className={`text-2xl font-bold ${issue.color}`}>{issue.value}</div>
                        <div className="text-xs text-gray-500">{issue.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {validationSummary.valid_contacts > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>{validationSummary.valid_contacts} contacts</strong> are ready to be imported!
                    {validationSummary.contacts_with_issues > 0 && (
                      <span> {validationSummary.contacts_with_issues} contacts have issues that need attention.</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button onClick={handleStartOver} variant="outline" className="flex-1">
                  Upload Another File
                </Button>
                {validationSummary.valid_contacts > 0 && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      toast({
                        title: "Import Starting",
                        description: "Contacts will be imported to your database.",
                      })
                      // TODO: Implement actual import functionality
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Import {validationSummary.valid_contacts} Contacts
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Field Mapping Modal */}
      <ContactFieldMappingModal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        uploadData={uploadData}
        onConfirmMapping={handleConfirmMapping}
      />
    </div>
  )
}
