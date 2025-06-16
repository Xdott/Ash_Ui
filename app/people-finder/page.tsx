import { AuthGuard } from "@/components/auth-guard"
import CompanyPeopleFinder from "@/components/company-people-finder"

export default function PeopleFinderPage() {
  return (
    <AuthGuard>
      <CompanyPeopleFinder />
    </AuthGuard>
  )
}
