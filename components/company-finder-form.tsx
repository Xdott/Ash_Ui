"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Building2, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import debounce from "lodash.debounce"

interface CompanyFinderFormProps {
  companyName: string
  setCompanyName: (name: string) => void
  onSubmit: () => void
  loading: boolean
}

export function CompanyFinderForm({ companyName, setCompanyName, onSubmit, loading }: CompanyFinderFormProps) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [disableSuggestions, setDisableSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (companyName === "") {
      setDisableSuggestions(false)
    }
  }, [companyName])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchSuggestions = debounce(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      if (!API_URL) {
        // Mock company suggestions - matches your API format exactly
        const mockSuggestions = [
          { company_name: "Apple Inc", domain: "apple.com" },
          { company_name: "Microsoft Corporation", domain: "microsoft.com" },
          { company_name: "Google LLC", domain: "google.com" },
          { company_name: "Amazon.com Inc", domain: "amazon.com" },
          { company_name: "Meta Platforms Inc", domain: "meta.com" },
          { company_name: "Tesla Inc", domain: "tesla.com" },
          { company_name: "Netflix Inc", domain: "netflix.com" },
          { company_name: "Salesforce Inc", domain: "salesforce.com" },
          { company_name: "Adobe Inc", domain: "adobe.com" },
          { company_name: "Oracle Corporation", domain: "oracle.com" },
          { company_name: "Spotify Technology", domain: "spotify.com" },
          { company_name: "Uber Technologies", domain: "uber.com" },
          { company_name: "Airbnb Inc", domain: "airbnb.com" },
          { company_name: "Slack Technologies", domain: "slack.com" },
          { company_name: "Snapchat Inc", domain: "snapchat.com" },
          { company_name: "Square Inc", domain: "squareup.com" },
          { company_name: "Stripe Inc", domain: "stripe.com" },
          { company_name: "Shopify Inc", domain: "shopify.com" },
          { company_name: "Zoom Video Communications", domain: "zoom.us" },
          { company_name: "Dropbox Inc", domain: "dropbox.com" },
        ].filter((company) => company.company_name.toLowerCase().includes(query.toLowerCase()))

        console.log("Mock suggestions for query:", query, mockSuggestions)
        setSuggestions(mockSuggestions)
        setShowSuggestions(mockSuggestions.length > 0)
        return
      }

      // Real API call
      console.log("Fetching suggestions from API for query:", query)
      const res = await fetch(`${API_URL}/company-suggestions?q=${encodeURIComponent(query)}`)
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`)
      }

      const data = await res.json()
      console.log("API response:", data)

      // Your API returns: [{ company_name: "...", domain: "..." }, ...]
      setSuggestions(data || [])
      setShowSuggestions(data && data.length > 0)
    } catch (err) {
      console.error("Suggestion fetch failed:", err)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, 200)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCompanyName(value)

    if (!disableSuggestions) {
      fetchSuggestions(value)
    }
  }

  const selectCompanyFromSuggestion = (suggestion: any) => {
    console.log("=== SELECTION DEBUG ===")
    console.log("Full suggestion object:", suggestion)
    console.log("suggestion.company_name:", suggestion.company_name)
    console.log("suggestion.domain:", suggestion.domain)
    console.log("Current companyName state:", companyName)

    // FORCE selection of company_name only
    const nameToSelect = suggestion.company_name
    console.log("Name being selected:", nameToSelect)

    if (!nameToSelect) {
      console.error("ERROR: No company_name found!")
      return
    }

    // Set the company name
    setCompanyName(nameToSelect)
    console.log("Called setCompanyName with:", nameToSelect)

    // Hide suggestions
    setSuggestions([])
    setShowSuggestions(false)
    setDisableSuggestions(true)

    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Verify what was actually set
    setTimeout(() => {
      console.log("State after selection:", companyName)
    }, 100)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    setSuggestions([])
    setDisableSuggestions(true)
    onSubmit()
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur mb-8">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              ref={inputRef}
              placeholder="Enter company name..."
              value={companyName}
              onChange={handleInputChange}
              className="pl-10 py-6 text-lg border-2 focus:border-green-500"
              autoComplete="off"
            />

            {/* Company Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 mt-1"
              >
                <div className="py-1">
                  {suggestions.map((suggestion: any, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log("Clicked suggestion:", suggestion)
                        selectCompanyFromSuggestion(suggestion)
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log("Clicked suggestion (onClick):", suggestion)
                        selectCompanyFromSuggestion(suggestion)
                      }}
                    >
                      {/* PRIMARY: Show company name prominently */}
                      <div className="font-medium text-gray-900 text-sm">
                        {suggestion.company_name || "NO COMPANY NAME"}
                      </div>
                      {/* SECONDARY: Show domain as small gray text */}
                      {suggestion.domain && <div className="text-xs text-gray-500">{suggestion.domain}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-6 px-8 text-lg bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            disabled={loading || !companyName}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Find Company
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
