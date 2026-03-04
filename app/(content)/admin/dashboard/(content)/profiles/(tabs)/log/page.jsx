// app/admin/dashboard/profiles/log/page.tsx
import LogView from "./LogView"
import { logQuery } from "@/_servers/admin-action/logAction"

export default async function AdminActivityLogPage() {
  const logs = await logQuery({ page: 1 })

  return (
    <LogView logs={logs} />
  )
}
