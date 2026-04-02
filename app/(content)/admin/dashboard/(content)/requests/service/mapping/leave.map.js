import { safeFormat } from "@/_functions/globalFunction"
import { getWorkHours } from "../request.service"

export function mapLeave(data = []) {
  if (!Array.isArray(data)) return []

  return data.map(r => {
    const workHours = getWorkHours(r.user?.shift, r.user?.location)

    return {
      id: r.id,
      requestedBy: {
        name: r.user?.name ?? "-",
        email: r.user?.email ?? "-",
        location: r.user?.location?.name ?? "-",
      },

      shift: r.user?.shift ?? null,
      workHours,

      leave: {
        name: r.leaveType?.name,
        category: r.leaveType?.category,
      },

      reason: r.reason ?? "-",
      startDate: safeFormat(r.startDate, "d MMMM yyyy"),
      endDate: safeFormat(r.endDate, "d MMMM yyyy"),
      date: safeFormat(r.createdAt, "d MMMM yyyy"),

      status: r.status,
      adminReason: r.adminReason
    }
  })
}
