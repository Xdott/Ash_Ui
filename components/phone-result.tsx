"use client"

import { Phone, Check, X, Globe, Signal, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PhoneResultProps {
  result: any | null
  loading?: boolean
}

export function PhoneResult({ result, loading = false }: PhoneResultProps) {
  if (loading) {
    return (
      <Card className="shadow-xl border-0 bg-blue-50 backdrop-blur">
        <CardContent className="p-8 text-center">
          <div className="text-blue-600 mb-4">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Validating Phone Number...</h3>
            <p>Please wait while we validate your phone number.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (result && result.error) {
    return (
      <Card className="shadow-xl border-0 bg-red-50/80 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4 flex-shrink-0">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-800 mb-1">Validation Error</h2>
              <p className="text-red-700">{result.error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (result) {
    return (
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Validation Results</h2>
              <p className="text-gray-600">Analysis for {result.phone_number || "phone number"}</p>
            </div>
            <Badge
              variant={result.valid ? "default" : "destructive"}
              className={`text-sm px-3 py-1 ${
                result.valid ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              {result.valid ? "Valid" : "Invalid"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Phone className="h-4 w-4 text-gray-600 mr-2" />
                <p className="text-sm font-semibold text-gray-700">Phone Number</p>
              </div>
              <p className="text-base font-bold text-gray-900 break-all">{result.phone_number || "N/A"}</p>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Globe className="h-4 w-4 text-gray-600 mr-2" />
                <p className="text-sm font-semibold text-gray-700">Country Code</p>
              </div>
              <p className="text-base font-bold text-gray-900">{result.country_code || "N/A"}</p>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Signal className="h-4 w-4 text-gray-600 mr-2" />
                <p className="text-sm font-semibold text-gray-700">Carrier</p>
              </div>
              <p className="text-base font-bold text-gray-900">{result.carrier || "N/A"}</p>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Phone className="h-4 w-4 text-gray-600 mr-2" />
                <p className="text-sm font-semibold text-gray-700">Line Type</p>
              </div>
              <p className="text-base font-bold text-gray-900">{result.line_type || "N/A"}</p>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${
              result.valid ? "bg-gradient-to-r from-green-50 to-emerald-50" : "bg-gradient-to-r from-red-50 to-pink-50"
            }`}
          >
            <div className="flex items-start">
              {result.valid ? (
                <>
                  <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">Valid Phone Number</h3>
                    <p className="text-green-700 text-sm">
                      This phone number is valid and can receive calls and messages.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Invalid Phone Number</h3>
                    <p className="text-red-700 text-sm">
                      This phone number is invalid or cannot receive calls and messages.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-white/50 backdrop-blur">
      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-500 max-w-md">
          <div className="bg-yellow-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Phone className="h-12 w-12 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Ready to Validate</h3>
          <p className="text-gray-600 leading-relaxed">
            Enter a phone number with country code to get detailed validation results including carrier information and
            line type analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
