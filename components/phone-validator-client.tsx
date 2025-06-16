"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Phone, Shield, Loader2, ArrowLeft, Check, X, Globe, Signal } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function PhoneValidatorClient() {
  const [phone, setPhone] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0()

  // Fix hydration by ensuring component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="mb-4">You need to be logged in to use the Phone Validator.</p>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  const validatePhone = async () => {
    console.log("🔥 Phone validation started")
    console.log("🔥 Phone:", phone)
    console.log("🔥 API_URL:", API_URL)
    console.log("🔥 User:", user)

    if (!phone.trim()) {
      console.log("❌ No phone number provided")
      toast({
        title: "Please enter a phone number",
        variant: "destructive",
      })
      return
    }

    if (!API_URL) {
      console.log("❌ API_URL is not defined")
      toast({
        title: "Configuration Error",
        description: "API URL is not configured. Please check your environment variables.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      if (!user?.email) {
        console.log("❌ User email not found")
        toast({
          title: "Unauthorized",
          description: "You must be logged in to validate phone numbers.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const requestBody = {
        user_id: user.email,
        phone: phone.trim(),
      }

      console.log("📡 Making API request to:", `${API_URL}/validate_phone_number`)
      console.log("📡 Request body:", requestBody)

      const response = await fetch(`${API_URL}/validate_phone_number`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response ok:", response.ok)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
          console.log("❌ Error response data:", errorData)
        } catch (e) {
          console.log("❌ Could not parse error response as JSON")
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log("✅ Success response data:", responseData)

      const finalResult = Array.isArray(responseData) ? responseData[0] : responseData
      console.log("✅ Final result:", finalResult)

      setResult(finalResult)

      toast({
        title: "Phone validation completed",
        description: `Phone number ${finalResult.valid ? "is valid" : "is invalid"}`,
      })
    } catch (error: any) {
      console.error("💥 Phone validation error:", error)
      console.error("💥 Error message:", error.message)

      const errorMessage = error.message || "Unexpected error occurred during validation."
      setResult({ error: errorMessage })
      toast({
        title: "Validation failed",
        description: errorMessage,
        variant: "destructive",
      })
    }

    setLoading(false)
    console.log("🏁 Phone validation completed")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("📝 Form submitted")
    validatePhone()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      console.log("⌨️ Enter key pressed")
      validatePhone()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg mb-4">
              <Phone className="h-7 w-7 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Phone Validator</h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Validate phone numbers worldwide with detailed carrier and line type information
            </p>
          </div>

          

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Input Section */}
            <Card className="lg:col-span-2 shadow-xl border-0 bg-white/90 backdrop-blur">
              <CardContent className="p-6 pt-12">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 text-yellow-600 mr-2" />
                      <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Phone Number
                      </label>
                      <span className="ml-1 text-xs text-red-500">*</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => {
                        console.log("📝 Phone input changed:", e.target.value)
                        setPhone(e.target.value)
                      }}
                      onKeyPress={handleKeyPress}
                      className="py-3 text-base border-2 focus:border-yellow-500"
                      required
                      suppressHydrationWarning
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Include country code for best results (e.g., +1 for US, +44 for UK)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 text-base bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
                    disabled={loading || !phone.trim()}
                    suppressHydrationWarning
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Validate Phone
                      </>
                    )}
                  </Button>

        
                </form>
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="lg:col-span-3">
              {loading ? (
                <Card className="shadow-xl border-0 bg-blue-50 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <div className="text-blue-600 mb-4">
                      <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                      <h3 className="text-xl font-semibold mb-2">Validating Phone Number...</h3>
                      <p>Please wait while we validate your phone number.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : result && result.error ? (
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
              ) : result ? (
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Validation Results</h2>
                        <p className="text-gray-600">Analysis for {result.phone_number || phone}</p>
                      </div>
                      <Badge
                        variant={result.valid ? "default" : "destructive"}
                        className={`text-sm px-3 py-1 ${
                          result.valid
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
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
                        result.valid
                          ? "bg-gradient-to-r from-green-50 to-emerald-50"
                          : "bg-gradient-to-r from-red-50 to-pink-50"
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
              ) : (
                <Card className="shadow-xl border-0 bg-white/50 backdrop-blur">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center text-gray-500 max-w-md">
                      <div className="bg-yellow-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Phone className="h-12 w-12 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-700">Ready to Validate</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Enter a phone number with country code to get detailed validation results including carrier
                        information and line type analysis.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
