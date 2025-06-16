"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  Download,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface UploadRecord {
  upload_id: string
  filename: string
  total_rows: number
  valid_rows: number
  invalid_rows: number
  status: string
  created_at: string
  processed_at: string | null
  completed_at: string | null
  validation_summary: any
  actual_imported_count: number
}

interface PaginationInfo {
  page: number
  limit: number
  total_count: number
  total_pages: number
}

export default function UploadHistoryPage() {
  const { user, isAuthenticated } = useAuth0()
  const { toast } = useToast()

  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total_count: 0,
    total_pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUploadHistory = async (page = 1) => {
    if (!user?.email) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contacts/upload-history?email=${encodeURIComponent(user.email)}&page=${page}&limit=20`,
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch upload history")
      }

      const data = await response.json()
      setUploads(data.history || [])
      setPagination(
        data.pagination || {
          page: 1,
          limit: 20,
          total_count: 0,
          total_pages: 0,
        },
      )
    } catch (error) {
      console.error("Error fetching upload history:", error)
      console.error("API URL being used:", `${API_BASE_URL}/api/contacts/upload-history`)
      setError(error instanceof Error ? error.message : "Failed to load upload history")
      toast({
        title: "Connection Error",
        description: `Cannot connect to API at ${API_BASE_URL}. Please check if the backend server is running.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchUploadHistory(1)
    }
  }, [isAuthenticated, user?.email])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "validated":
        return <Badge className="bg-blue-100 text-blue-800">Validated</Badge>
      case "pending_mapping":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Mapping</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const calculateSuccessRate = (valid: number, total: number) => {
    if (total === 0) return 0
    return Math.round((valid / total) * 100)
  }

  const handlePageChange = (newPage: number) => {
    fetchUploadHistory(newPage)
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view your upload history.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/upload-contacts")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Upload
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload History</h1>
              <p className="text-gray-600 mt-1">View your contact import history and results</p>
            </div>
          </div>
          <Button onClick={() => (window.location.href = "/upload-contacts")} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            New Upload
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {uploads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Uploads</p>
                  <p className="text-2xl font-bold text-blue-600">{pagination.total_count}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold text-green-600">
                    {uploads.reduce((sum, upload) => sum + upload.total_rows, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Successfully Imported</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {uploads.reduce((sum, upload) => sum + upload.valid_rows, 0)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Success Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(
                      uploads.reduce(
                        (sum, upload) => sum + calculateSuccessRate(upload.valid_rows, upload.total_rows),
                        0,
                      ) / uploads.length,
                    )}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading upload history...</span>
        </div>
      )}

      {/* Upload History List */}
      {!loading && uploads.length > 0 && (
        <div className="space-y-4">
          {uploads.map((upload) => (
            <Card key={upload.upload_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900">{upload.filename}</h3>
                      {getStatusBadge(upload.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Rows</p>
                        <p className="text-lg font-semibold">{upload.total_rows}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Valid Contacts</p>
                        <p className="text-lg font-semibold text-green-600">{upload.valid_rows}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issues Found</p>
                        <p className="text-lg font-semibold text-orange-600">{upload.invalid_rows}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Success Rate</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {calculateSuccessRate(upload.valid_rows, upload.total_rows)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Uploaded: {formatDate(upload.created_at)}</span>
                      </div>
                      {upload.completed_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Completed: {formatDate(upload.completed_at)}</span>
                        </div>
                      )}
                      {upload.actual_imported_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Imported: {upload.actual_imported_count} contacts</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {upload.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement download functionality
                          toast({
                            title: "Download",
                            description: "Download functionality coming soon!",
                          })
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && uploads.length === 0 && !error && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upload History</h3>
            <p className="text-gray-600 mb-6">You haven't uploaded any contact files yet.</p>
            <Button onClick={() => (window.location.href = "/upload-contacts")} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Your First File
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.total_pages}({pagination.total_count} total uploads)
          </span>

          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.total_pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
