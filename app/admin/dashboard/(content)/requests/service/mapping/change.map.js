import { safeFormat } from "@/_function/globalFunction"

export function mapShiftChange(data = []) {
  if (!Array.isArray(data)) return []

  return data.map(r => ({
    id: r.id,
    requestedBy: {
      name: r.requestedBy?.name || "-",
      email: r.requestedBy?.email || "-",
    },
    user: {
      name: r.targetUser?.name || "-",
      email: r.targetUser?.email || "-",
    },
    oldShift: {
      name: r.oldShift?.name || "-",
      type: r.oldShift?.type || "-",
    },
    targetShift: {
      name: r.targetShift?.name || "-",
      type: r.targetShift?.type || "-",
    },
    reason: r.reason || "-",
    startDate: safeFormat(r.startDate, "d MMMM yyyy"),
    endDate: safeFormat(r.endDate, "d MMMM yyyy"),
    date: safeFormat(r.createdAt, "d MMMM yyyy"),
    status:
      r.status === "PENDING_ADMIN" || r.status === "PENDING_TARGET"
        ? "PENDING"
        : r.status,
  }))
}
