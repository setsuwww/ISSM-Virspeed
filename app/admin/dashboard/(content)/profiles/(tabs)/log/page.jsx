import AdminLogList from "./LogListView"
import { logQuery } from "@/_server/admin-action/logQuery"

export default async function AdminActivityLogPage() {
  const logs = await logQuery({ page: 1 })

  return (
    <>
      <AdminLogList logs={logs} />
    </>
  )
}
