"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  FileText,
  Play,
  Edit,
  Trash2,
  Download,
  Calendar,
  Filter,
  Users,
  MoreHorizontal,
  Upload,
  FolderOpen,
  Save,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface SavedReport {
  id: string
  name: string
  description: string
  filters: any
  createdAt: string
  resultCount: number
  lastRun?: string
  isScheduled?: boolean
  tenantId?: string
  createdBy?: string
}

interface ReportResult {
  contacts: any[]
  totalCount: number
  executedAt: string
}

export function ReportDashboard({ onRunReport }: { onRunReport?: (report: SavedReport) => Promise<void> }) {
  const [reports, setReports] = useState<SavedReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [runningReportId, setRunningReportId] = useState<string | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState("")
  const { user, isAuthenticated } = useAuth0()
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadReports()
    }
  }, [isAuthenticated, user?.email])

  const loadReports = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/reports?email=${encodeURIComponent(user.email)}`)

      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      } else {
        console.error("Failed to load reports")
        // Fallback to localStorage for backward compatibility
        const savedReports = JSON.parse(localStorage.getItem("savedSearches") || "[]")
        setReports(savedReports)
      }
    } catch (error) {
      console.error("Error loading reports:", error)
      // Fallback to localStorage
      const savedReports = JSON.parse(localStorage.getItem("savedSearches") || "[]")
      setReports(savedReports)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const runReport = async (report: SavedReport) => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run reports.",
        variant: "destructive",
      })
      return
    }

    setRunningReportId(report.id)

    try {
      if (onRunReport) {
        // Use the custom runReport function passed from parent
        await onRunReport(report)
      } else {
        // Execute the report against the backend API
        toast({
          title: "Executing Report",
          description: `Running "${report.name}" with saved filters...`,
        })

        const response = await fetch(`${API_URL}/execute-report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            reportId: report.id,
            filters: report.filters,
          }),
        })

        if (response.ok) {
          const result: ReportResult = await response.json()

          // Update the report with new execution data
          const updatedReport = {
            ...report,
            lastRun: new Date().toISOString(),
            resultCount: result.totalCount,
          }

          // Update the report in the backend
          await fetch(`${API_URL}/reports/${report.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              ...updatedReport,
            }),
          })

          // Update local state
          setReports((prev) => prev.map((r) => (r.id === report.id ? updatedReport : r)))

          toast({
            title: "Report Executed Successfully",
            description: `Found ${result.totalCount.toLocaleString()} contacts matching your criteria.`,
          })

          // You could also navigate to results or show them in a modal
          console.log("Report Results:", result.contacts)
        } else {
          const error = await response.json()
          throw new Error(error.message || "Failed to execute report")
        }
      }
    } catch (error) {
      console.error("Error running report:", error)
      toast({
        title: "Report Execution Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setRunningReportId(null)
    }
  }

  const saveReport = async (reportData: Omit<SavedReport, "id" | "createdAt">) => {
    if (!user?.email) return

    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          ...reportData,
        }),
      })

      if (response.ok) {
        const newReport = await response.json()
        setReports((prev) => [...prev, newReport])
        toast({
          title: "Report Saved",
          description: `"${reportData.name}" has been saved successfully.`,
        })
      } else {
        throw new Error("Failed to save report")
      }
    } catch (error) {
      console.error("Error saving report:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save the report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!user?.email) return

    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      })

      if (response.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId))
        toast({
          title: "Report Deleted",
          description: "The report has been removed.",
        })
      } else {
        throw new Error("Failed to delete report")
      }
    } catch (error) {
      console.error("Error deleting report:", error)
      // Fallback to localStorage
      const updatedReports = reports.filter((r) => r.id !== reportId)
      setReports(updatedReports)
      localStorage.setItem("savedSearches", JSON.stringify(updatedReports))

      toast({
        title: "Report Deleted",
        description: "The report has been removed.",
      })
    }
  }

  const exportReport = (report: SavedReport) => {
    // Create a detailed report export
    const exportData = {
      reportName: report.name,
      description: report.description,
      filters: report.filters,
      createdAt: report.createdAt,
      lastRun: report.lastRun,
      resultCount: report.resultCount,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report_${report.name.replace(/\s+/g, "_").toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Report Exported",
      description: `"${report.name}" has been exported as JSON file.`,
    })
  }

  const exportAllReports = () => {
    if (reports.length === 0) {
      toast({
        title: "No Reports",
        description: "No reports available to export.",
        variant: "destructive",
      })
      return
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalReports: reports.length,
      tenantInfo: {
        userEmail: user?.email,
        exportedBy: user?.name || user?.email,
      },
      reports: reports.map((report) => ({
        reportName: report.name,
        description: report.description,
        filters: report.filters,
        createdAt: report.createdAt,
        lastRun: report.lastRun,
        resultCount: report.resultCount,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tenant_reports_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "All Reports Exported",
      description: `Exported ${reports.length} tenant reports as JSON file.`,
    })
  }

  const exportReportsAsCSV = () => {
    if (reports.length === 0) {
      toast({
        title: "No Reports",
        description: "No reports available to export.",
        variant: "destructive",
      })
      return
    }

    const headers = [
      "Report Name",
      "Description",
      "Created Date",
      "Last Run",
      "Result Count",
      "Active Filters",
      "Created By",
    ]
    const csvRows = reports.map((report) => {
      const activeFilters = Object.entries(report.filters)
        .filter(([key, value]) => {
          if (Array.isArray(value)) return value.length > 0
          if (typeof value === "string") return value.trim() !== "" && value !== "all"
          return false
        })
        .map(([key, value]) => {
          if (Array.isArray(value)) return `${key}(${value.length})`
          return key
        })
        .join(", ")

      return [
        report.name,
        report.description || "",
        new Date(report.createdAt).toLocaleDateString(),
        report.lastRun ? new Date(report.lastRun).toLocaleDateString() : "Never",
        report.resultCount.toString(),
        activeFilters || "None",
        report.createdBy || "Unknown",
      ]
        .map((field) =>
          typeof field === "string" && (field.includes(",") || field.includes('"'))
            ? `"${field.replace(/"/g, '""')}"`
            : field,
        )
        .join(",")
    })

    const csvContent = [headers.join(","), ...csvRows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tenant_reports_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Reports Exported as CSV",
      description: `Exported ${reports.length} tenant reports as CSV file.`,
    })
  }

  const importReports = async () => {
    if (!user?.email) return

    try {
      const importedData = JSON.parse(importData)
      let reportsToImport = []

      // Handle different import formats
      if (importedData.reports && Array.isArray(importedData.reports)) {
        // Full export format
        reportsToImport = importedData.reports
      } else if (Array.isArray(importedData)) {
        // Direct array format
        reportsToImport = importedData
      } else if (importedData.reportName) {
        // Single report format
        reportsToImport = [importedData]
      } else {
        throw new Error("Invalid import format")
      }

      // Import reports via API
      const response = await fetch(`${API_URL}/reports/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          reports: reportsToImport,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        await loadReports() // Reload reports from server

        setImportData("")
        setShowImportDialog(false)

        toast({
          title: "Reports Imported",
          description: `Successfully imported ${result.importedCount} report(s) to your tenant.`,
        })
      } else {
        throw new Error("Failed to import reports")
      }
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Invalid data format. Please check and try again.",
        variant: "destructive",
      })
    }
  }

  const getFilterSummary = (filters: any) => {
    const activeFilters = []
    if (filters.status?.length > 0) activeFilters.push(`Status: ${filters.status.length}`)
    if (filters.source?.length > 0) activeFilters.push(`Source: ${filters.source.length}`)
    if (filters.jobTitle?.length > 0) activeFilters.push(`Job Title: ${filters.jobTitle.length}`)
    if (filters.company?.trim()) activeFilters.push("Company")
    if (filters.location?.trim()) activeFilters.push("Location")
    if (filters.validationStatus !== "all") activeFilters.push("Validation")
    if (filters.enrichmentStatus !== "all") activeFilters.push("Enrichment")
    if (filters.tags?.length > 0) activeFilters.push(`Tags: ${filters.tags.length}`)

    return activeFilters.length > 0 ? activeFilters.join(", ") : "No filters"
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access your tenant reports.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Reports</h1>
          <p className="text-gray-600">Manage and execute your tenant-level saved search reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Reports
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export All
                <MoreHorizontal className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportAllReports}>
                <FileText className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportReportsAsCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Recently Run</p>
                <p className="text-2xl font-bold text-gray-900">{reports.filter((r) => r.lastRun).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.reduce((sum, r) => sum + r.resultCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    reports.filter((r) => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(r.createdAt) > weekAgo
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search reports by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading tenant reports...</p>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {reports.length === 0 ? "No Reports Yet" : "No Reports Found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {reports.length === 0
                ? "Save your contact searches as reports to reuse them later."
                : "Try adjusting your search terms."}
            </p>
            {reports.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Go to the Contacts tab, apply filters, and click "Save Search" to create your first report.
                </p>
                <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Or Import Existing Reports
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{report.name}</CardTitle>
                    {report.description && <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => runReport(report)} disabled={runningReportId === report.id}>
                        {runningReportId === report.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Run Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportReport(report)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteReport(report.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{report.resultCount.toLocaleString()}</div>
                    <div className="text-xs text-blue-600">Contacts</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        Object.values(report.filters).filter((v) =>
                          Array.isArray(v) ? v.length > 0 : v && v !== "all",
                        ).length
                      }
                    </div>
                    <div className="text-xs text-green-600">Filters</div>
                  </div>
                </div>

                {/* Filter Summary */}
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    Active Filters
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{getFilterSummary(report.filters)}</div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created: {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                  {report.lastRun && (
                    <div className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      Last run: {new Date(report.lastRun).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => runReport(report)}
                    disabled={runningReportId === report.id}
                    className="flex-1"
                  >
                    {runningReportId === report.id ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    {runningReportId === report.id ? "Running..." : "Run Report"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportReport(report)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Report Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports
                  .sort(
                    (a, b) =>
                      new Date(b.lastRun || b.createdAt).getTime() - new Date(a.lastRun || a.createdAt).getTime(),
                  )
                  .slice(0, 5)
                  .map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.lastRun ? new Date(report.lastRun).toLocaleDateString() : "Never"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          {report.resultCount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.lastRun ? "default" : "outline"}>
                          {report.lastRun ? "Active" : "Not Run"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => runReport(report)}
                          disabled={runningReportId === report.id}
                        >
                          {runningReportId === report.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Import Tenant Reports
            </DialogTitle>
            <DialogDescription>
              Paste the JSON data from a previously exported report or reports collection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="import-data">JSON Data</Label>
              <Textarea
                id="import-data"
                placeholder="Paste your exported JSON data here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="mt-1 min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <div className="font-medium text-blue-900 mb-1">Supported Formats:</div>
              <div className="text-blue-700 space-y-1">
                <div>• Single report JSON (from individual export)</div>
                <div>• Multiple reports JSON (from "Export All" feature)</div>
                <div>• Reports will be imported to your tenant database</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={importReports} disabled={!importData.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Import Reports
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
