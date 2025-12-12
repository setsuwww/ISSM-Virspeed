import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import RequestsTableRow from "./RequestsTableRow"

export default function RequestsDataTable({ type, items, isHistory }) {
  const config = {
    permission: {
      empty: isHistory ? "No permission history" : "No pending permission requests",
      columns: ["Requested By", "Shift", "Send at", "Reason", "Status"],
    },
    changeshift: {
      empty: isHistory ? "No shift change history" : "No pending shift change requests",
      columns: ["Requester", "Responser", "Shifts change", "Period", "Reason", "Status",],
    },
    early: {
      empty: isHistory ? "No early checkout history" : "No pending early checkout requests",
      columns: ["Requested By", "Shift", "Reason", "Status", "Requested At"],
    },
    leave: {
      empty: isHistory ? "No leave history" : "No pending leave requests",
      columns: ["Requested By", "Shift", "Period", "Send At", "Reason", "Status"],
    },
  }

  const cfg = config[type]

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-400">{cfg.empty}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {cfg.columns.map((c) => (
            <TableHead key={c}>{c}</TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((r) => (
          <RequestsTableRow key={r.id} {...r} requestType={type} />
        ))}
      </TableBody>
    </Table>
  )
}
