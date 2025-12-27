import { safeFormat } from "@/_function/globalFunction"

export function mapShiftRequests(data) {
  return data.map(r => ({
    id: r.id,
    requestedBy: r.requestedBy?.name ?? "-",
    user: r.targetUser?.name ?? "-",
    oldShift: r.oldShift?.name ?? "-",
    targetShift: r.targetShift?.name ?? "-",
    reason: r.reason ?? "-",
    date: safeFormat(r.createdAt, "d MMMM yyyy"),
    status: r.status.startsWith("PENDING") ? "PENDING" : r.status,
  }))
}
