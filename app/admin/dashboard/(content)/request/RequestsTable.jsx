import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import RequestsTableRow from "./RequestsTableRow"

export default function RequestsDataTable({ type, items, isHistory }) {
  const config = {
    permission: {
      empty: isHistory ? "No permission history" : "No pending permission requests",
      columns: ["Requested By", "Shift", "Reason", "Send at", "Status"],
    },
    changeshift: {
      empty: isHistory ? "No shift change history" : "No pending shift change requests",
      columns: ["Requester", "Responser", "Shifts change", "Period", "Reason", "Status",],
    },
    early: {
      empty: isHistory ? "No early checkout history" : "No pending early checkout requests",
      columns: ["Requested By", "Shift", "Reason", "Send At", "Status",],
    },
    leave: {
      empty: isHistory ? "No leave history" : "No pending leave requests",
      columns: ["Requested By", "Shift", "Period", "Reason", "Send At", "Status"],
    },
  }

  const cfg = config[type];

  if (!cfg) {
    return (
      <div className="py-12 text-center text-slate-400">
        Invalid request type
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">{cfg.empty}</p>
      </div>
    );
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
