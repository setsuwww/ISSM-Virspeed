import { getCurrentUser } from "@/_lib/auth"
import { ProfileView } from "./ProfileView"
import { DashboardHeader } from "../../DashboardHeader"
import ProfileTabsLayout from "./(tabs)/Tabs"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  return (
    <div>
      <DashboardHeader title="Your Profile" subtitle="See your private information here"/>
      <ProfileTabsLayout />
      <ProfileView user={user} />
    </div>
  )
}
