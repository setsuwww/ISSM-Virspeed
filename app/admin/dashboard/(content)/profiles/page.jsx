import { getCurrentUser } from "@/_lib/auth"
import { ProfileView } from "./ProfileView"
import { DashboardHeader } from "../../DashboardHeader"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  return (
    <div>
      <DashboardHeader title="Your Profile" subtitle="See your private information here"/>
      <ProfileView user={user} />
    </div>
  )
}
