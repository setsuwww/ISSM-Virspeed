import { prisma } from "@/_lib/prisma"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/_lib/auth"
import HistoryTable from "./HistoryTable"
import { ContentInformation } from "@/_components/common/ContentInformation"
import ContentForm from '@/_components/common/ContentForm';

export const revalidate = 60

async function getAttendanceHistory(userId, order) {
  return prisma.attendance.findMany({
    where: { userId },
    select: {
      id: true, date: true,
      status: true, reason: true, adminReason: true,
      approval: true,
      shift: { select: { type: true, name: true } },
      checkInTime: true, checkOutTime: true,
    },
    orderBy: { date: order },
  })
}

export default async function Page({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) return notFound()

  const order = searchParams?.order === "asc" ? "asc" : "desc"

  const attendance = await getAttendanceHistory(user.id, order)

  const tableData = attendance.map(a => ({
    id: a.id,
    rawDate: a.date,
    shift: `${a.shift?.type || "-"} - ${a.shift?.name}`,
    status: a.status === "PERMISSION"
      ? `${a.status} (${a.approval || "PENDING"})`
      : a.status,
    reason: a.reason || "—",
    adminNote: a.adminReason || "-",
    checkInTime: a.checkInTime || " ",
    checkOutTime: a.checkOutTime || " ",
  }))

  return (
    <ContentForm>
      <ContentForm.Header>
        <ContentInformation
          heading="Your Attendance History"
          subheading="Review all your attendance, lateness, and permission records below"
        />
      </ContentForm.Header>

      <ContentForm.Body>
        <HistoryTable data={tableData} initialOrder={order} />
      </ContentForm.Body>
    </ContentForm>
  )
}
