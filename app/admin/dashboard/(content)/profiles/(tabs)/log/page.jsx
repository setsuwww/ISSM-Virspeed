// app/admin/dashboard/logs/page.tsx
import AdminLogList from "./LogListView"
import { logQuery } from "@/_server/admin-action/logQuery"
import { DashboardHeader } from "../../../../DashboardHeader"

export default async function AdminActivityLogPage() {
  const logs = await logQuery({ page: 1 })

  return (
    <>
      <DashboardHeader title="Activity Logs" />
      <AdminLogList logs={logs} />
    </>
  )
}
