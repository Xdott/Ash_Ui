"use client"

import { Mail, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EmailResultProps {
  result: any | null
}

export function EmailResult({ result }: EmailResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 50) return "bg-yellow-100"
    return "bg-red-100"
  }

  if (!result) {
    return (
      <Card className="shadow-xl border-0 bg-white/50 backdrop-blur h-full">
        <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
          <div className="text-center text-gray-500 max-w-md">
            <div className="bg-purple-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Mail className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Validate Any Email Address</h3>
            <p className="text-gray-600 leading-relaxed">
              Enter an email address to check if it's valid and deliverable. Our system will verify the domain, mail
              server configuration, and mailbox existence.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.result?.data?.email}</h2>
            <Badge
              variant={result.result?.data?.result === "deliverable" ? "success" : "destructive"}
              className="px-3 py-1"
            >
              {result.result?.data?.result === "deliverable" ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" /> Valid email
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" /> Invalid email
                </>
              )}
            </Badge>
          </div>

          {result.result?.data?.score !== undefined && (
            <div className="text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBgColor(
                  result.result.data.score,
                )}`}
              >
                <span className={`text-2xl font-bold ${getScoreColor(result.result.data.score)}`}>
                  {result.result.data.score}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Confidence Score</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <p className="text-sm font-semibold text-gray-500 mb-2">SMTP Check</p>
            <div className="flex items-center">
              {result.result?.data?.smtp_check ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="font-medium">{result.result?.data?.smtp_check ? "Passed" : "Failed"}</span>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <p className="text-sm font-semibold text-gray-500 mb-2">MX Records</p>
            <div className="flex items-center">
              {result.result?.data?.mx_records ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="font-medium">{result.result?.data?.mx_records ? "Valid" : "Invalid"}</span>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
            <p className="text-sm font-semibold text-gray-500 mb-2">Accept All</p>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium">{result.result?.data?.accept_all ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-3">Validation Summary</h3>
          <p className="text-gray-600">
            {result.result?.data?.result === "deliverable"
              ? "This email address is valid and can receive messages. The domain has proper mail server configuration and the mailbox exists."
              : "This email address may not be deliverable. There could be issues with the domain's mail server configuration or the mailbox might not exist."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
