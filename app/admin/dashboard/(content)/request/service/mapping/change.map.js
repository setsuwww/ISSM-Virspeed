import { safeFormat } from "@/_function/globalFunction"

export function mapShiftChange(r) {
  return {
    id: r.id,
    requestedBy: {
      name: r.requestedBy?.name || "-",
      email: r.requestedBy?.email || "-",
    },
    user: {
      name: r.targetUser?.name || "-",
      email: r.targetUser?.email || "-",
    },
    oldShift: r.oldShift ?? null,
    targetShift: r.targetShift ?? null,
    reason: r.reason || "-",
    startDate: safeFormat(r.startDate, "d MMMM yyyy"),
    endDate: safeFormat(r.endDate, "d MMMM yyyy"),
    date: safeFormat(r.createdAt, "d MMMM yyyy"),
    status:
      r.status === "PENDING_ADMIN" || r.status === "PENDING_TARGET"
        ? "PENDING"
        : r.status,
  }
}
