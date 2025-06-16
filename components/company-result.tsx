"use client"

import { Building2, Globe, Users, MapPin, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CompanyResultProps {
  result: any | null
  userEmail?: string
}

export function CompanyResult({ result, userEmail }: CompanyResultProps) {
  if (!result) {
    return (
      <Card className="shadow-xl border-0 bg-white/50 backdrop-blur">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-500 max-w-md">
            <div className="bg-green-100 p-8 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <Building2 className="h-16 w-16 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">Discover Company Information</h3>
            <p className="text-gray-600 leading-relaxed">
              Enter a company name to find detailed information including funding history, employee count, and more.
            </p>
            {userEmail && <p className="text-sm text-gray-500 mt-4">Logged in as: {userEmail}</p>}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{result.display_name}</h2>
                <p className="text-gray-500 mt-1">{result.industry}</p>
                {(userEmail || result.user_email) && (
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="px-2 py-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {userEmail || result.user_email}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            {result.website && (
              <a
                href={`https://${result.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white border-2 border-green-200 rounded-full text-green-700 hover:bg-green-50"
              >
                <Globe className="mr-2 h-4 w-4" />
                Website
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <div className="flex items-center mb-2">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <p className="text-sm font-semibold text-gray-500">Location</p>
            </div>
            <p className="text-lg font-medium text-gray-900">{result.location_name || "N/A"}</p>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <p className="text-sm font-semibold text-gray-500">Employees</p>
            </div>
            <p className="text-lg font-medium text-gray-900">
              {typeof result.employee_count === "number" ? result.employee_count.toLocaleString() : "N/A"}
            </p>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <div className="flex items-center mb-2">
              <Building2 className="h-5 w-5 text-gray-400 mr-2" />
              <p className="text-sm font-semibold text-gray-500">Industry</p>
            </div>
            <p className="text-lg font-medium text-gray-900">{result.industry || "N/A"}</p>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <div className="flex items-center mb-2">
              <Globe className="h-5 w-5 text-gray-400 mr-2" />
              <p className="text-sm font-semibold text-gray-500">Founded</p>
            </div>
            <p className="text-lg font-medium text-gray-900">{result.year_founded || "N/A"}</p>
          </div>
        </div>

        {result.description && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-3">Company Summary</h3>
            <p className="text-gray-600 leading-relaxed">{result.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
