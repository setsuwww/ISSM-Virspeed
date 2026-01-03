import { safeFormat } from "@/_function/globalFunction"

export function mapEarlyCheckout(r) {
  return {
    id: r.id,
    name: r.user.name,
    email: r.user.email,
    date: safeFormat(r.date, "dd/MM/yyyy"),
    reason: r.reason ?? "-",
    status: r.status,
  }
}
