import { safeFormat } from "@/_function/globalFunction"
import { getWorkHours } from "../../page"

export function mapPermissionRequests(data) {
  return data.map(r => ({
    id: r.id,
    user: r.user?.name ?? "-",
    division: r.user?.division?.name ?? "-",
    shift: r.shift?.name ?? "-",
    workHours: getWorkHours(r.shift, r.user?.division),
    reason: r.reason ?? "-",
    date: safeFormat(r.date, "d MMMM yyyy"),
    status: r.approval,
  }))
}
