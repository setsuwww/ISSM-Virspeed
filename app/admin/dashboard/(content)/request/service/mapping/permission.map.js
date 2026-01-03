import { safeFormat } from "@/_function/globalFunction"
import { minutesToTime } from "@/_function/globalFunction"

export function mapPermission(r) {
  return {
    id: r.id,
    name: r.user.name,
    email: r.user.email,
    division: r.user.division?.name ?? "-",
    shift: r.shift?.name ?? "-",
    shiftTime: r.shift
      ? `${minutesToTime(r.shift.startTime)} - ${minutesToTime(
          r.shift.endTime
        )}`
      : "-",
    date: safeFormat(r.date, "dd/MM/yyyy"),
    reason: r.reason ?? "-",
    approval: r.approval,
  }
}
