import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import HistoryTable from "./HistoryTable"
import HistoryLayout from "./HistoryLayout"

export const revalidate = 60

export default async function Page({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) return notFound()

  const order = searchParams?.order === "asc" ? "asc" : "desc"

  const attendance = await prisma.attendance.findMany({
    where: { userId: user.id },
    orderBy: { date: order },
    include: {
      shift: {
        select: {
          type: true,
          name: true,
        },
      },
    },
  })

  const tableData = attendance.map(a => ({
    id: a.id,

    dateValue: a.date.getTime(),

    dateLabel: format(a.date, "dd MMMM"),
    dateFull: format(a.date, "EEEE, dd MMMM yyyy"),

    shiftType: a.shift?.type ?? "OFF",
    shiftName: a.shift?.name ?? "—",

    status: a.status,
    approval: a.approval ?? null,

    reason: a.reason ?? "—",
    adminNote: a.adminReason ?? null,

    checkInTime: a.checkInTime ? format(a.checkInTime, "HH:mm") : null,
    checkOutTime: a.checkOutTime ? format(a.checkOutTime, "HH:mm") : null,
  }))

  return (
    <HistoryLayout>
      <HistoryTable data={tableData} initialOrder={order}/>
    </HistoryLayout>
  )
}
