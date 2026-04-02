import { safeFormat } from "@/_functions/globalFunction"
import { getWorkHours } from "../request.service"

export function mapPermission(data = []) {
  if (!Array.isArray(data)) return []

  return data.map(r => {
    const workHours = getWorkHours(r.shift, r.user?.location)

    return {
      id: r.id,
      requestedBy: {
        name: r.user?.name || "-",
        email: r.user?.email || "-",
        location: r.user?.location?.name || "-",
      },
      shift: {
        name: r.shift?.name || "-",
        type: r.shift?.type || "-",
      },
      workHours,
      reason: r.reason || "-",
      date: safeFormat(r.date, "d MMMM yyyy"),
      status: r.approval || "UNKNOWN",
    }
  })
}
