"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { X, Filter, RotateCcw, Users, Building2, MapPin, Shield, Star, Calendar, Tag } from "lucide-react"

interface FilterState {
  search: string
  status: string[]
  source: string[]
  jobTitle: string[]
  company: string
  location: string
  validationStatus: string
  enrichmentStatus: string
  dateRange: {
    from: string
    to: string
  }
  tags: string[]
}

interface AdvancedFiltersProps {
  open: boolean
  filters: FilterState
  onFiltersChange: (filters: Partial<FilterState>) => void
  onClose: () => void
  onClear: () => void
  contactCount: number
}

const statusOptions = ["Customer", "Lead", "Opportunity", "Prospect", "Qualified Lead", "Cold Lead"]

const sourceOptions = ["Website", "Referral", "Social Media", "Email Campaign", "Cold Call", "Trade Show", "Partner"]

const jobTitleOptions = ["CEO", "CTO", "Manager", "Developer", "Director", "VP", "Analyst", "Consultant"]

const tagOptions = ["VIP", "Enterprise", "Technical", "High Priority", "Startup", "Decision Maker", "Consulting"]

export function AdvancedFilters({
  open,
  filters,
  onFiltersChange,
  onClose,
  onClear,
  contactCount,
}: AdvancedFiltersProps) {
  if (!open) return null

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked ? [...filters.status, status] : filters.status.filter((s) => s !== status)
    onFiltersChange({ status: newStatus })
  }

  const handleSourceChange = (source: string, checked: boolean) => {
    const newSource = checked ? [...filters.source, source] : filters.source.filter((s) => s !== source)
    onFiltersChange({ source: newSource })
  }

  const handleJobTitleChange = (jobTitle: string, checked: boolean) => {
    const newJobTitle = checked ? [...filters.jobTitle, jobTitle] : filters.jobTitle.filter((j) => j !== jobTitle)
    onFiltersChange({ jobTitle: newJobTitle })
  }

  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked ? [...filters.tags, tag] : filters.tags.filter((t) => t !== tag)
    onFiltersChange({ tags: newTags })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.source.length > 0) count++
    if (filters.jobTitle.length > 0) count++
    if (filters.company.trim()) count++
    if (filters.location.trim()) count++
    if (filters.validationStatus !== "all") count++
    if (filters.enrichmentStatus !== "all") count++
    if (filters.tags.length > 0) count++
    return count
  }

  return (
    <div className="w-80 border-l bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Advanced Filters</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{contactCount} contacts found</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={getActiveFilterCount() === 0}
            className="text-blue-600 hover:text-blue-700"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Status Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Status
                {filters.status.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {filters.status.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {statusOptions.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status.includes(status)}
                    onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                  />
                  <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer flex-1">
                    {status}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Source Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-green-600" />
                Source
                {filters.source.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {filters.source.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sourceOptions.map((source) => (
                <div key={source} className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-${source}`}
                    checked={filters.source.includes(source)}
                    onCheckedChange={(checked) => handleSourceChange(source, checked as boolean)}
                  />
                  <Label htmlFor={`source-${source}`} className="text-sm font-normal cursor-pointer flex-1">
                    {source}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Job Title Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                Job Title
                {filters.jobTitle.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {filters.jobTitle.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {jobTitleOptions.map((jobTitle) => (
                <div key={jobTitle} className="flex items-center space-x-2">
                  <Checkbox
                    id={`job-${jobTitle}`}
                    checked={filters.jobTitle.includes(jobTitle)}
                    onCheckedChange={(checked) => handleJobTitleChange(jobTitle, checked as boolean)}
                  />
                  <Label htmlFor={`job-${jobTitle}`} className="text-sm font-normal cursor-pointer flex-1">
                    {jobTitle}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Company Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-orange-600" />
                Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Filter by company name..."
                value={filters.company}
                onChange={(e) => onFiltersChange({ company: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Location Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Filter by city, state, or country..."
                value={filters.location}
                onChange={(e) => onFiltersChange({ location: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Validation Status Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Email Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={filters.validationStatus}
                onValueChange={(value) => onFiltersChange({ validationStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Validation Status</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="not_validated">Not Validated</SelectItem>
                  <SelectItem value="high_score">High Score (80+)</SelectItem>
                  <SelectItem value="medium_score">Medium Score (60-79)</SelectItem>
                  <SelectItem value="low_score">Low Score (&lt;60)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Enrichment Status Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-600" />
                Enrichment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={filters.enrichmentStatus}
                onValueChange={(value) => onFiltersChange({ enrichmentStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Enrichment Status</SelectItem>
                  <SelectItem value="enriched">Enriched</SelectItem>
                  <SelectItem value="not_enriched">Not Enriched</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-600" />
                Tags
                {filters.tags.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {filters.tags.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tagOptions.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={(checked) => handleTagChange(tag, checked as boolean)}
                  />
                  <Label htmlFor={`tag-${tag}`} className="text-sm font-normal cursor-pointer flex-1">
                    {tag}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Date Range Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                Date Added
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="date-from" className="text-xs text-gray-500">
                  From
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) =>
                    onFiltersChange({
                      dateRange: { ...filters.dateRange, from: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="text-xs text-gray-500">
                  To
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) =>
                    onFiltersChange({
                      dateRange: { ...filters.dateRange, to: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
