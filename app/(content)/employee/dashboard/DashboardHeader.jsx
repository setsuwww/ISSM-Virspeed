import { getCurrentUser } from "@/_lib/auth"
import DashboardHeaderClient from "./DashboardHeaderClient"

export default async function DashboardHeader() {
  const user = await getCurrentUser()

  return <DashboardHeaderClient user={user} />
}
