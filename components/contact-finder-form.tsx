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
    <div className="bg-white/80 backdrop-blur shadow-xl rounded-xl border-0">
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-3" />
              <label htmlFor="employeeName" className="font-semibold text-gray-700">
                Full Name
              </label>
              <span className="ml-2 text-xs text-red-500">*</span>
            </div>
            <input
              id="employeeName"
              type="text"
              placeholder="Jane Doe"
              value={formData.employeeName}
              onChange={(e) => handleInputChange("employeeName", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-blue-600 mr-3" />
              <label htmlFor="companyName" className="font-semibold text-gray-700">
                Company
              </label>
              <span className="ml-2 text-xs text-red-500">*</span>
            </div>
            <input
              id="companyName"
              type="text"
              placeholder="Acme Inc"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-3" />
              <label htmlFor="location" className="font-semibold text-gray-700">
                Location
              </label>
              <span className="ml-2 text-xs text-gray-500">(Optional)</span>
            </div>
            <input
              id="location"
              type="text"
              placeholder="New York, NY"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-blue-600 mr-3" />
              <label htmlFor="title" className="font-semibold text-gray-700">
                Title
              </label>
              <span className="ml-2 text-xs text-gray-500">(Optional)</span>
            </div>
            <input
              id="title"
              type="text"
              placeholder="Software Engineer"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
            disabled={loading || !formData.employeeName.trim() || !formData.companyName.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Find Contact
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
