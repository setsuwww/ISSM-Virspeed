import { safeFormat } from "@/_function/globalFunction"

export function mapLeave(r) {
  return {
    id: r.id,
    name: r.user.name,
    email: r.user.email,
    startDate: safeFormat(r.startDate, "dd/MM/yyyy"),
    endDate: safeFormat(r.endDate, "dd/MM/yyyy"),
    reason: r.reason ?? "-",
    status: r.status,
  }
}
