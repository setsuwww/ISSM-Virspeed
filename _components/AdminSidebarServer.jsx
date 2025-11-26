import { Sidebar } from "./AdminSidebar"
import { getCurrentUser } from "@/_lib/auth"

export default async function SidebarServer() {
  const user = await getCurrentUser()

  return <Sidebar user={user} />
}
