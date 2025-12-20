import { prisma } from "@/_lib/prisma"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/_lib/auth"
import HistoryTable from "./HistoryTable"
import { ContentInformation } from "@/_components/common/ContentInformation"
import ContentForm from "@/_components/common/ContentForm"
import { format } from "date-fns"

export const revalidate = 60

async function getAttendanceHistory(userId, order) {
  return prisma.attendance.findMany({
    where: { userId },
    orderBy: { date: order },
    select: {
      id: true, date: true, status: true, approval: true, reason: true, adminReason: true,
      checkInTime: true, checkOutTime: true,
      shift: { select: { type: true, name: true }},
    },
  })
}

export default async function Page({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) return notFound()

  const order = searchParams?.order === "asc" ? "asc" : "desc"
  const attendance = await getAttendanceHistory(user.id, order)

  const tableData = attendance.map(a => ({
    id: a.id,
    dateValue: a.date.getTime(),
    dateLabel: format(a.date, "dd MMMM"),
    dateFull: format(a.date, "EEEE, dd MMMM yyyy"),
    shiftType: a.shift?.type ?? "OFF",
    shiftName: a.shift?.name ?? "—",
    status: a.status,
    approval: a.approval,
    reason: a.reason ?? "—",
    adminNote: a.adminReason ?? null,
    checkInTime: a.checkInTime ? format(a.checkInTime, "HH:mm") : null,
    checkOutTime: a.checkOutTime ? format(a.checkOutTime, "HH:mm") : null,
  }))

  return (
    <ContentForm>
      <ContentForm.Header>
        <ContentInformation
          heading="Your Attendance History"
          subheading="Review all your attendance records"
        />
      </ContentForm.Header>

      <ContentForm.Body>
        <HistoryTable data={tableData} initialOrder={order} />
      </ContentForm.Body>
    </ContentForm>
  )
}
