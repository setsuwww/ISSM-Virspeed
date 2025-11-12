import { getCurrentUser } from "@/_lib/auth"
import { ProfileView } from "./ProfileView"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  return (
    <div>
      <ProfileView user={user} />
    </div>
  )
}
