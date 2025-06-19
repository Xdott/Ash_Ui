"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Save, FileText } from "lucide-react"

interface SaveSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, description: string) => void
  filterCount: number
  resultCount: number
}

export function SaveSearchDialog({ open, onOpenChange, onSave, filterCount, resultCount }: SaveSearchDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return

    setLoading(true)
    try {
      await onSave(name.trim(), description.trim())
      setName("")
      setDescription("")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Save Search as Report
          </DialogTitle>
          <DialogDescription>
            Save your current search filters as a reusable report. This will capture {filterCount} active filters
            returning {resultCount} contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="report-name">Report Name *</Label>
            <Input
              id="report-name"
              placeholder="e.g., High-Value Enterprise Leads"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="report-description">Description (Optional)</Label>
            <Textarea
              id="report-description"
              placeholder="Describe what this report is used for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <div className="font-medium text-gray-900 mb-1">Report Summary:</div>
            <div className="text-gray-600">• {filterCount} active filters</div>
            <div className="text-gray-600">• {resultCount} contacts match criteria</div>
            <div className="text-gray-600">• Can be run again to get updated results</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
