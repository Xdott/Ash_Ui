import { AuthGuard } from "@/components/auth-guard"
import { ReportPage } from "@/components/report-page"

export default function ReportsPage() {
  return (
    <AuthGuard>
      <ReportPage />
    </AuthGuard>
  )
}
