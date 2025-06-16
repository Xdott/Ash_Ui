import { Loader2, Users } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
          <Users className="h-8 w-8 text-white" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-lg text-gray-600">Loading People Finder...</p>
      </div>
    </div>
  )
}
