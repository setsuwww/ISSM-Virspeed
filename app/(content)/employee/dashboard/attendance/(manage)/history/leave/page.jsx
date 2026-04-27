import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { notFound } from "next/navigation"
import { format } from "date-fns"

import HistoryLayout from "../HistoryLayout"
import LeaveTable from "./LeaveTable"
import { LEAVE_RULES } from "@/_components/_constants/static/leaveIndonesianRule"

export const revalidate = 60

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) return notFound()

  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { leaveType: true },
  })

  const tableData = leaves.map(l => ({
    id: l.id,

    dateValue: l.createdAt.getTime(),
    dateLabel: format(l.createdAt, "dd MMMM"),
    dateFull: format(l.createdAt, "EEEE, dd MMMM yyyy"),

    type: l.leaveType?.code,
    typeLabel: l.leaveType?.name ?? l.leaveType?.code ?? l.leaveTypeId,

    startDate: format(l.startDate, "dd MMM yyyy"),
    endDate: format(l.endDate, "dd MMM yyyy"),

    reason: l.reason,
    adminReason: l.adminReason,
    status: l.status,
  }))

  return (
    <HistoryLayout>
      <LeaveTable data={tableData} />
    </HistoryLayout>
  )
}
