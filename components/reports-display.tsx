"use client"

import { BarChart, PieChart, TrendingUp, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ReportsDisplayProps {
  stats: any | null
}

export function ReportsDisplay({ stats }: ReportsDisplayProps) {
  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-md border-0">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-bold">Contact Finder Usage</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Validations</p>
              <p className="text-3xl font-bold">{stats.user_validation_count}</p>
            </div>
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${Math.min((stats.user_validation_count / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-0">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-bold">Email Finder Usage</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unique Emails</p>
              <p className="text-3xl font-bold">{stats.distinct_email_count}</p>
            </div>
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <PieChart className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full"
              style={{ width: `${Math.min((stats.distinct_email_count / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-0 md:col-span-2">
        <CardContent className="pt-6">
          <div className="flex items-center mb-6">
            <BarChart className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-bold">Usage Summary</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Contact Finder Validations</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-bold">{stats.user_validation_count}</p>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Email Finder Unique Emails</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-bold">{stats.distinct_email_count}</p>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Data updated as of {new Date().toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
