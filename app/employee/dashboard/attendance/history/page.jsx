import { prisma } from "@/_lib/prisma"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/_lib/auth"
import HistoryTable from "./HistoryTable"
import { ContentInformation } from "@/_components/common/ContentInformation"
import ContentForm from '@/_components/common/ContentForm';

export const revalidate = 60

async function getAttendanceHistory(userId) {
  return prisma.attendance.findMany({
    where: { userId },
    select: {
      id: true, date: true,
      status: true, reason: true, adminReason: true,
      approval: true,
      shift: { select: { type: true, name: true } },
      checkInTime: true, checkOutTime: true,
    },
    orderBy: { date: "desc" },
  })
}

export default async function Page({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) return notFound()

  const order = searchParams?.order === "asc" ? "asc" : "desc"

  const attendance = await getAttendanceHistory(user.id)

  const tableData = attendance
    .sort((a, b) => order === "asc" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date))
    .map((a) => ({ id: a.id,
      date: new Date(a.date).toLocaleDateString("en-US", {
        weekday: "long",
      }),
      datePart: new Date(a.date).toLocaleDateString("en-US", {
        day: "numeric", month: "long", year: "numeric",
      }),
      shift: `${a.shift?.type || "-"} - ${a.shift?.name}`,
      status: a.status === "PERMISSION" ? `${a.status} (${a.approval || "PENDING"})` : a.status,
      reason: a.reason || "—",
      adminNote: a.adminReason || "-",
      checkInTime: a.checkInTime || "-", checkOutTime: a.checkOutTime || "-",
    }))

  return (
    <ContentForm>
      <ContentForm.Header>
        <ContentInformation heading="Your Attendance History" subheading="Review all your attendance, lateness, and permission records below"/>
      </ContentForm.Header>
      <ContentForm.Body>
        <HistoryTable data={tableData} initialOrder={order} />
      </ContentForm.Body>
    </ContentForm>
  )
}
