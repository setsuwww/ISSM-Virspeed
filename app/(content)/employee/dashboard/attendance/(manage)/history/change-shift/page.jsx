import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { notFound } from "next/navigation"
import { format } from "date-fns"

import HistoryLayout from "../HistoryLayout"
import ChangeShiftTable from "./ChangeShiftTable"

export const revalidate = 60

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) return notFound()

  const requests = await prisma.shiftChangeRequest.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      oldShift: { select: { name: true, type: true } },
      newShift: { select: { name: true, type: true } },
      targetShift: { select: { name: true, type: true } },
      targetUser: { select: { name: true, email: true } },
    },
  })

  const tableData = requests.map(r => ({
    id: r.id,

    dateLabel: format(r.createdAt, "dd MMMM yyyy"),
    dateFull: format(r.createdAt, "EEEE"),

    oldShift: r.oldShift
      ? { name: r.oldShift.name, type: r.oldShift.type }
      : null,

    newShift: r.newShift
      ? { name: r.newShift.name, type: r.newShift.type }
      : r.targetShift
        ? { name: r.targetShift.name, type: r.targetShift.type }
        : null,

    targetUserName: r.targetUser?.name ?? null,
    targetUserEmail: r.targetUser?.email ?? null,

    startDate: format(r.startDate, "dd MMMM yyyy"),
    endDate: r.endDate ? format(r.endDate, "dd MMMM yyyy") : "—",

    reason: r.reason,
    status: r.status,
  }))

  return (
    <HistoryLayout>
      <ChangeShiftTable data={tableData} />
    </HistoryLayout>
  )
}
