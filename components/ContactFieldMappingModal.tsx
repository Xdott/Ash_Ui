"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, AlertCircle, FileText, ArrowRight, Target, Sparkles, Info, Zap } from "lucide-react"

interface ContactFieldMappingModalProps {
  isOpen: boolean
  onClose: () => void
  uploadData: {
    upload_id?: string
    columns?: string[]
    auto_mappings?: Record<string, string>
    confidence_scores?: Record<string, number>
    preview_data?: Record<string, any>[]
    total_rows?: number
    credit_info?: {
      available_credits: number
      required_credits: number
      remaining_after_upload: number
    }
    sheet_info?: {
      total_sheets: number
      sheet_names: string[]
      selected_sheet: string
    }
  } | null
  onConfirmMapping: (mappings: Record<string, string>) => Promise<void>
  userEmail?: string
}

const ContactFieldMappingModal: React.FC<ContactFieldMappingModalProps> = ({
  isOpen,
  onClose,
  uploadData,
  onConfirmMapping,
  userEmail,
}) => {
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mappingStats, setMappingStats] = useState({
    mapped: 0,
    unmapped: 0,
    required: 0,
    total: 0,
  })
  const [fieldCategories, setFieldCategories] = useState<Record<string, Record<string, string>>>({})
  const [specialOptions, setSpecialOptions] = useState({
    ignore: "Don't import this column",
    skip: "Skip this column",
  })

  // Default field categories if API fails
  const defaultFieldCategories = {
    "Basic Information": {
      email: "Email Address (Required)",
      first_name: "First Name",
      last_name: "Last Name",
      full_name: "Full Name",
      phone: "Phone Number",
      mobile: "Mobile Number",
    },
    "Company Information": {
      company: "Company Name",
      job_title: "Job Title",
      department: "Department",
      industry: "Industry",
      company_size: "Company Size",
    },
    Location: {
      address: "Address",
      city: "City",
      state: "State/Province",
      country: "Country",
      postal_code: "Postal Code",
    },
    "Social & Web": {
      linkedin_url: "LinkedIn URL",
      website: "Website",
      twitter: "Twitter Handle",
      facebook: "Facebook Profile",
    },
    Additional: {
      notes: "Notes",
      tags: "Tags",
      source: "Lead Source",
      status: "Status",
      created_date: "Created Date",
      updated_date: "Updated Date",
    },
  }

  // Initialize mappings when modal opens
  useEffect(() => {
    console.log("🔍 Modal opened with uploadData:", uploadData)

    if (uploadData?.auto_mappings) {
      console.log("📋 Setting auto mappings:", uploadData.auto_mappings)
      setFieldMappings(uploadData.auto_mappings)
      updateMappingStats(uploadData.auto_mappings)
    } else {
      console.log("⚠️ No auto mappings found")
      setFieldMappings({})
      updateMappingStats({})
    }

    if (isOpen) {
      setError(null)
    }
  }, [uploadData, isOpen])

  useEffect(() => {
    const fetchFieldOptions = async () => {
      if (isOpen) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
          const response = await fetch(`${apiUrl}/api/contacts/field-options`)

          if (!response.ok) {
            console.warn("Failed to fetch field options, using defaults")
            setFieldCategories(defaultFieldCategories)
            return
          }

          const data = await response.json()

          if (data.field_categories) {
            setFieldCategories(data.field_categories)
          } else {
            setFieldCategories(defaultFieldCategories)
          }

          if (data.special_options) {
            setSpecialOptions(data.special_options)
          }
        } catch (error) {
          console.error("Error fetching field options:", error)
          console.log("Using default field categories")
          setFieldCategories(defaultFieldCategories)
        }
      }
    }

    fetchFieldOptions()
  }, [isOpen])

  const updateMappingStats = (mappings: Record<string, string>) => {
    const total = uploadData?.columns?.length || 0
    const mapped = Object.keys(mappings).filter((key) => mappings[key] && mappings[key] !== "ignore").length
    const unmapped = total - mapped
    const required = Object.values(mappings).filter((field) =>
      ["email", "first_name", "last_name"].includes(field),
    ).length

    console.log("📊 Updating mapping stats:", { total, mapped, unmapped, required, mappings })
    setMappingStats({ mapped, unmapped, required, total })
  }

  const handleFieldMappingChange = (csvColumn: string, contactField: string) => {
    console.log(`🔄 Mapping change: ${csvColumn} -> ${contactField}`)

    const newMappings = { ...fieldMappings }

    if (contactField === "ignore" || contactField === "") {
      delete newMappings[csvColumn]
    } else {
      newMappings[csvColumn] = contactField
    }

    console.log("📝 New mappings:", newMappings)
    setFieldMappings(newMappings)
    updateMappingStats(newMappings)
  }

  const getConfidenceBadge = (column: string) => {
    const confidence = uploadData?.confidence_scores?.[column] || 0
    if (confidence >= 90)
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
          High
        </Badge>
      )
    if (confidence >= 70)
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
          Medium
        </Badge>
      )
    if (confidence >= 50)
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
          Low
        </Badge>
      )
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
        Manual
      </Badge>
    )
  }

  const hasRequiredFields = () => {
    const values = Object.values(fieldMappings)
    return values.includes("email")
  }

  const handleConfirmMapping = async () => {
    if (!hasRequiredFields()) {
      setError("Email field is required for contact import")
      return
    }

    if (!uploadData?.upload_id) {
      setError("Upload ID is missing. Please try uploading the file again.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🚀 ULTRA FAST: Confirming mapping with field mappings:", fieldMappings)

      await onConfirmMapping(fieldMappings)
      onClose()
    } catch (error) {
      console.error("ULTRA FAST mapping confirmation failed:", error)

      let errorMessage = "Failed to confirm mapping"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderFieldSelect = (csvColumn: string) => {
    const currentMapping = fieldMappings[csvColumn] || ""

    return (
      <Select value={currentMapping} onValueChange={(value) => handleFieldMappingChange(csvColumn, value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select field or ignore" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="ignore">🚫 {specialOptions.ignore}</SelectItem>
          {Object.entries(fieldCategories).map(([category, fields]) => (
            <React.Fragment key={category}>
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">{category}</div>
              {Object.entries(fields).map(([fieldKey, fieldLabel]) => {
                // Ensure fieldKey is never empty string
                const safeFieldKey = fieldKey || `field_${Math.random()}`
                return (
                  <SelectItem key={safeFieldKey} value={safeFieldKey}>
                    {fieldLabel}
                  </SelectItem>
                )
              })}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Debug logging
  console.log("🐛 Debug Info:", {
    isOpen,
    uploadData,
    columns: uploadData?.columns,
    columnsLength: uploadData?.columns?.length,
    fieldMappings,
    mappingStats,
  })

  if (!uploadData) {
    console.log("❌ No upload data provided")
    return null
  }

  if (!uploadData.columns || uploadData.columns.length === 0) {
    console.log("❌ No columns found in upload data")
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No Columns Found</DialogTitle>
            <DialogDescription>
              No columns were detected in your uploaded file. Please check your file format and try again.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-blue-600" />
            ULTRA FAST Field Mapping
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Zap className="h-3 w-3 mr-1" />
              Memory Optimized
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review and customize how your file columns map to contact fields. ULTRA FAST processing with credit
            validation enabled.
          </DialogDescription>
        </DialogHeader>

        {/* Credit Information */}
        {uploadData?.credit_info && (
          <Alert className="mb-4 border-blue-200 bg-blue-50 flex-shrink-0">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Credits:</strong> {uploadData.credit_info.available_credits} available,{" "}
                  {uploadData.credit_info.required_credits} required
                </span>
                <span>
                  <strong>Remaining:</strong> {uploadData.credit_info.remaining_after_upload}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Sheet Information */}
        {uploadData?.sheet_info?.total_sheets > 1 && (
          <Alert className="mb-4 flex-shrink-0">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              This Excel file contains {uploadData.sheet_info.total_sheets} sheets. Currently processing:{" "}
              <strong>{uploadData.sheet_info.selected_sheet}</strong>
              <br />
              Available sheets: {uploadData.sheet_info.sheet_names.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-4 flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Mapping Summary */}
        <Card className="mb-4 flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              ULTRA FAST Mapping Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{mappingStats.total}</div>
                <div className="text-xs text-gray-500">Total Columns</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{mappingStats.mapped}</div>
                <div className="text-xs text-gray-500">Mapped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{mappingStats.unmapped}</div>
                <div className="text-xs text-gray-500">Unmapped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{mappingStats.required}</div>
                <div className="text-xs text-gray-500">Required</div>
              </div>
            </div>
            <Progress value={(mappingStats.mapped / Math.max(mappingStats.total, 1)) * 100} className="mt-3" />
          </CardContent>
        </Card>

        {/* Validation Alert */}
        <Alert
          className={`mb-4 flex-shrink-0 ${hasRequiredFields() ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          {hasRequiredFields() ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={hasRequiredFields() ? "text-green-800" : "text-red-800"}>
            {hasRequiredFields()
              ? "✅ Ready for ULTRA FAST processing!"
              : "❌ Email field is required for contact import."}
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-4 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmMapping}
            disabled={!hasRequiredFields() || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Zap className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Process {uploadData.total_rows || 0} Contacts
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="mapping" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="mapping">Field Mapping ({uploadData.columns.length} columns)</TabsTrigger>
            <TabsTrigger value="preview">Data Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="mapping" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-full w-full">
              <div className="space-y-3 pr-4 pb-4">
                {uploadData.columns.map((column, index) => (
                  <div key={`mapping-${column}-${index}`} className="border rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Column Name */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-blue-600 text-sm">{column}</span>
                        </div>
                        {getConfidenceBadge(column)}
                      </div>

                      {/* Arrow */}
                      <div className="col-span-1 flex justify-center">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>

                      {/* Field Select */}
                      <div className="col-span-7">{renderFieldSelect(column)}</div>

                      {/* Status Indicator */}
                      <div className="col-span-1 flex justify-center">
                        {fieldMappings[column] && fieldMappings[column] !== "ignore" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    </div>

                    {/* Sample Data */}
                    {uploadData.preview_data?.[0]?.[column] && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs border-l-2 border-blue-200">
                        <span className="text-gray-500 font-medium">Sample: </span>
                        <span className="font-mono text-gray-700">
                          {String(uploadData.preview_data[0][column]).substring(0, 50)}
                          {String(uploadData.preview_data[0][column]).length > 50 ? "..." : ""}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Preview of the first 3 rows from your uploaded file (ULTRA FAST mode)
                  </AlertDescription>
                </Alert>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        {uploadData.columns.map((column, index) => (
                          <th key={index} className="border border-gray-300 p-2 text-left font-medium min-w-[120px]">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uploadData.preview_data?.slice(0, 3).map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          {uploadData.columns.map((column, colIndex) => (
                            <td key={colIndex} className="border border-gray-300 p-2 max-w-[200px] truncate">
                              {row[column] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default ContactFieldMappingModal
