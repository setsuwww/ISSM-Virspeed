import LogListView from "./LogListView"
import { logQuery } from "@/_server/logAction"

export default async function AdminActivityLogPage() {
  const logs = await logQuery({ page: 1 })

  return (
    <>
      <LogListView logs={logs} />
    </>
  )
}
