import { safeFormat } from "@/_functions/globalFunction"
import { getWorkHours } from "../request.service"

export function mapEarlyCheckout(data = []) {
  if (!Array.isArray(data)) return []

  return data.map(r => {
    const workHours = getWorkHours(r.attendance?.shift, r.user?.location)

    return {
      id: r.id,
      requestedBy: {
        name: r.user?.name || "-",
        email: r.user?.email || "-",
        location: r.user?.location?.name || "-",
      },
      shift: {
        name: r.attendance?.shift?.name || "-",
        type: r.attendance?.shift?.type || "-",
      },
      workHours,
      checkoutTime: safeFormat(r.attendance?.checkOutTime, "HH:mm"),
      reason: r.reason || "-",
      date: safeFormat(r.attendance?.date, "d MMMM yyyy"),
      requestedAt: safeFormat(r.requestedAt, "d MMMM yyyy, HH:mm"),
      status: r.status,
    }
  })
}
