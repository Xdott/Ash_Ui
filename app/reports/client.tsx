"use client"

import { useState, useEffect } from "react"
import { BarChart } from "lucide-react"
import { ReportsDisplay } from "@/components/reports-display"

export function ReportsClient() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        user_validation_count: 245,
        distinct_email_count: 189,
      })
    }, 1000)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gray-100 p-3 rounded-full">
            <BarChart className="h-8 w-8 text-gray-700" />
          </div>
          <h1 className="text-3xl font-bold ml-4">Usage Statistics</h1>
        </div>

        <ReportsDisplay stats={stats} />
      </div>
    </div>
  )
}
