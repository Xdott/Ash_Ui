"use client"

import { useState, useEffect } from "react"

// Demo data
const DEMO_COMPANIES = [
  {
    companyId: "1",
    companyName: "Microsoft Corporation",
    industry: "Technology",
    location: "Redmond, WA",
    website: "microsoft.com",
    employeeCount: "10,000+",
    founded: "1975"
  },
  {
    companyId: "2", 
    companyName: "Apple Inc",
    industry: "Technology",
    location: "Cupertino, CA",
    website: "apple.com",
    employeeCount: "10,000+",
    founded: "1976"
  },
  {
    companyId: "3",
    companyName: "Google LLC",
    industry: "Technology", 
    location: "Mountain View, CA",
    website: "google.com",
    employeeCount: "10,000+",
    founded: "1998"
  },
  {
    companyId: "4",
    companyName: "Amazon",
    industry: "E-commerce",
    location: "Seattle, WA", 
    website: "amazon.com",
    employeeCount: "10,000+",
    founded: "1994"
  },
  {
    companyId: "5",
    companyName: "Tesla Inc",
    industry: "Automotive",
    location: "Austin, TX",
    website: "tesla.com", 
    employeeCount: "5,000-10,000",
    founded: "2003"
  },
  {
    companyId: "6",
    companyName: "Meta Platforms",
    industry: "Social Media",
    location: "Menlo Park, CA",
    website: "meta.com",
    employeeCount: "10,000+", 
    founded: "2004"
  },
  {
    companyId: "7",
    companyName: "Netflix Inc",
    industry: "Entertainment",
    location: "Los Gatos, CA", 
    website: "netflix.com",
    employeeCount: "1,000-5,000",
    founded: "1997"
  },
  {
    companyId: "8",
    companyName: "Spotify Technology",
    industry: "Music Streaming",
    location: "Stockholm, Sweden",
    website: "spotify.com",
    employeeCount: "1,000-5,000",
    founded: "2006"
  },
  {
    companyId: "9", 
    companyName: "Airbnb Inc",
    industry: "Travel & Hospitality",
    location: "San Francisco, CA",
    website: "airbnb.com", 
    employeeCount: "1,000-5,000",
    founded: "2008"
  },
  {
    companyId: "10",
    companyName: "Uber Technologies",
    industry: "Transportation",
    location: "San Francisco, CA",
    website: "uber.com",
    employeeCount: "5,000-10,000", 
    founded: "2009"
  },
  {
    companyId: "11",
    companyName: "Salesforce Inc",
    industry: "CRM Software",
    location: "San Francisco, CA",
    website: "salesforce.com",
    employeeCount: "10,000+",
    founded: "1999"
  },
  {
    companyId: "12",
    companyName: "Zoom Video",
    industry: "Video Communications", 
    location: "San Jose, CA",
    website: "zoom.us",
    employeeCount: "1,000-5,000",
    founded: "2011"
  }
]

interface Company {
  companyId: string
  companyName: string
  industry: string
  location: string
  website: string
  employeeCount: string
  founded: string
}

export default function CompanyDashboard() {
  const [companies, setCompanies] = useState<Company[]>(DEMO_COMPANIES)
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(DEMO_COMPANIES)
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter companies based on search
  useEffect(() => {
    const filtered = companies.filter(
      (company) =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCompanies(filtered)
    setCurrentPage(1)
  }, [searchTerm])

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageData = filteredCompanies.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)

  const handleSelectCompany = (companyId: string, checked: boolean) => {
    const newSelected = new Set(selectedCompanies)
    if (checked) {
      newSelected.add(companyId)
    } else {
      newSelected.delete(companyId)
    }
    setSelectedCompanies(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCompanies(new Set(currentPageData.map((c) => c.companyId)))
    } else {
      setSelectedCompanies(new Set())
    }
  }

  const enrichCompanies = () => {
    if (selectedCompanies.size === 0) {
      alert("Please select at least one company to enrich")
      return
    }
    alert(`Enriching ${selectedCompanies.size} companies...`)
  }

  const downloadData = () => {
    alert("Downloading company data...")
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="text-gray-600">Manage and enrich your company database</p>
        </div>
        <div className="flex space-x-2">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            Total: {companies.length}
          </span>
          <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">
            Selected: {selectedCompanies.size}
          </span>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={enrichCompanies}
            disabled={selectedCompanies.size === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🏢 Enrich Companies ({selectedCompanies.size})
          </button>
          <button
            onClick={downloadData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            📥 Export Data
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    currentPageData.length > 0 &&
                    currentPageData.every((company) => selectedCompanies.has(company.companyId))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Website
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Founded
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageData.map((company, index) => (
              <tr key={company.companyId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.has(company.companyId)}
                    onChange={(e) => handleSelectCompany(company.companyId, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{company.companyName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {company.industry}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {company.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    🔗 {company.website}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {company.employeeCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {company.founded}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search criteria" : "No companies available"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredCompanies.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCompanies.length)} of{" "}
              {filteredCompanies.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 bg-blue-600 text-white rounded-md">
                {currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}