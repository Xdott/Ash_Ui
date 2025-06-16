"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface EmailValidatorFormProps {
  onSubmit: (data: any) => void
  loading: boolean
}

export function EmailValidatorForm({ onSubmit, loading }: EmailValidatorFormProps) {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ email })
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur md:col-span-1">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-lg py-4 border-2 focus:border-purple-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full py-4 text-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Validate Email
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
