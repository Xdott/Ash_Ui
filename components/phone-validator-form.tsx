"use client"

import type React from "react"
import { useState } from "react"
import { Phone, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface PhoneValidatorFormProps {
  onSubmit: (data: { phone: string }) => void
  loading: boolean
}

export function PhoneValidatorForm({ onSubmit, loading }: PhoneValidatorFormProps) {
  const [phone, setPhone] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("📝 Form submitted with phone:", phone)
    onSubmit({ phone })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      console.log("⌨️ Enter key pressed")
      handleSubmit(e as any)
    }
  }

  return (
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
  )
}
