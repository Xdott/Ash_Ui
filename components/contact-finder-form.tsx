"use client"

import type React from "react"
import { useState } from "react"
import { User, Building, MapPin, Briefcase, Search, Loader2 } from "lucide-react"

interface ContactFinderFormProps {
  onSubmit: (data: any) => void
  loading: boolean
}

export function ContactFinderForm({ onSubmit, loading }: ContactFinderFormProps) {
  const [formData, setFormData] = useState({
    employeeName: "",
    companyName: "",
    location: "",
    title: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 text-blue-600 mr-2" />
              Full Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={formData.employeeName}
              onChange={(e) => handleInputChange("employeeName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building className="h-4 w-4 text-blue-600 mr-2" />
              Company
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder="Acme Inc"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 text-blue-600 mr-2" />
              Location
              <span className="text-xs text-gray-500 ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="New York, NY"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="h-4 w-4 text-blue-600 mr-2" />
              Title
              <span className="text-xs text-gray-500 ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Software Engineer"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
            disabled={loading || !formData.employeeName.trim() || !formData.companyName.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Contact
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
