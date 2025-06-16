import { AuthGuard } from "@/components/auth-guard"
import UploadContactPage from  "@/components/upload-contact-page"

export default function Page() {
  return (
    <AuthGuard>
      <UploadContactPage />
    </AuthGuard>
  )
}
