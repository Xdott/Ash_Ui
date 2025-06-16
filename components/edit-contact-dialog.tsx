"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Contact {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  company?: string
  phone?: string
  mobile?: string
  job_title?: string
  department?: string
  city?: string
  state?: string
  country?: string
  website?: string
  linkedin_url?: string
  lead_status?: string
  lead_source?: string
  [key: string]: any
}

interface EditContactDialogProps {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedContact: Contact) => Promise<void>
}

export function EditContactDialog({ contact, open, onOpenChange, onSave }: EditContactDialogProps) {
  const [editedContact, setEditedContact] = useState<Contact | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Initialize edited contact when dialog opens
  useState(() => {
    if (contact && open) {
      setEditedContact({ ...contact })
    }
  })

  const handleInputChange = (field: string, value: string) => {
    if (!editedContact) return
    setEditedContact({ ...editedContact, [field]: value })
  }

  const handleSave = async () => {
    if (!editedContact) return

    setSaving(true)
    try {
      await onSave(editedContact)
      toast({
        title: "Contact Updated",
        description: "Contact information has been successfully updated.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update contact",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!contact || !editedContact) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={editedContact.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editedContact.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={editedContact.first_name || ""}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={editedContact.last_name || ""}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={editedContact.mobile || ""}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editedContact.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={editedContact.company || ""}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={editedContact.job_title || ""}
                  onChange={(e) => handleInputChange("job_title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={editedContact.department || ""}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  value={editedContact.linkedin_url || ""}
                  onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editedContact.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={editedContact.state || ""}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={editedContact.country || ""}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_status">Lead Status</Label>
                <select
                  id="lead_status"
                  value={editedContact.lead_status || "new"}
                  onChange={(e) => handleInputChange("lead_status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_source">Lead Source</Label>
                <select
                  id="lead_source"
                  value={editedContact.lead_source || "import"}
                  onChange={(e) => handleInputChange("lead_source", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="import">Import</option>
                  <option value="website">Website</option>
                  <option value="social">Social Media</option>
                  <option value="referral">Referral</option>
                  <option value="email">Email Campaign</option>
                </select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
