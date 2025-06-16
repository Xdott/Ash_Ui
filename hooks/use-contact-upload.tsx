"use client"

import { useState, useCallback } from "react"

interface UploadData {
  upload_id: string
  columns: string[]
  auto_mappings: Record<string, string>
  confidence_scores: Record<string, number>
  preview_data: Record<string, any>[]
  total_rows: number
  filename: string
}

interface ValidationSummary {
  total_rows: number
  valid_contacts: number
  contacts_with_issues: number
  null_emails: number
  invalid_emails: number
  duplicate_emails: number
  issues_breakdown: {
    email_issues: string[]
    phone_issues: string[]
    name_issues: string[]
    required_field_issues: string[]
  }
}

export const useContactUpload = (userEmail: string) => {
  const [uploadData, setUploadData] = useState<UploadData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(
    async (file: File): Promise<UploadData> => {
      setIsLoading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("email", userEmail)

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
        const response = await fetch(`${apiUrl}/api/contacts/upload-contacts-file`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setUploadData(data)
        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed"
        setError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [userEmail],
  )

  const confirmMapping = useCallback(
    async (fieldMappings: Record<string, string>): Promise<ValidationSummary> => {
      if (!uploadData?.upload_id) {
        throw new Error("No upload session found")
      }

      setIsLoading(true)
      setError(null)

      try {
        const payload = {
          upload_id: uploadData.upload_id,
          field_mappings: fieldMappings,
          email: userEmail,
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
        const response = await fetch(`${apiUrl}/api/contacts/confirm-mapping`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Mapping confirmation failed: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        return result.validation_summary
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Mapping confirmation failed"
        setError(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [uploadData, userEmail],
  )

  const resetUpload = useCallback(() => {
    setUploadData(null)
    setError(null)
  }, [])

  return {
    uploadData,
    isLoading,
    error,
    uploadFile,
    confirmMapping,
    resetUpload,
  }
}
