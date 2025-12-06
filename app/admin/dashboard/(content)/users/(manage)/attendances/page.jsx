import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { AttendancesCard } from "./AttendancesCard"
import AttendancesTableClient from "./AttendancesTableClient"
import { prisma } from "@/_lib/prisma"
import { minutesToTime } from "@/_function/globalFunction"

async function getShifts() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const shifts = await prisma.shift.findMany({
    where: { type: { in: ["MORNING", "AFTERNOON", "EVENING"] } },
    include: {
      division: { select: { id: true, name: true } },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          attendances: {
            where: { date: { gte: startOfDay, lte: endOfDay } },
            select: { status: true, approval: true },
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  return shifts.map((shift) => ({
    id: shift.id,
    name: shift.name,
    type: shift.type,
    divisionName: shift.division?.name || "-",
    startTime: minutesToTime(shift.startTime),
    endTime: minutesToTime(shift.endTime),
    users: shift.users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      attendanceStatus:
        user.attendances[0]?.status && ["ABSENT", "LATE", "PERMISSION"].includes(user.attendances[0].status)
          ? user.attendances[0].status
          : "PRESENT",
      approval: user.attendances[0]?.approval || "",
    })),
  }))
}

export default async function AttendancesPage() {
  const shifts = await getShifts()

  return (
    <section>
      <DashboardHeader title="Attendances" subtitle="Employees attendance records"/>
      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            heading="Shift Overview"
            subheading="View attendance by shift"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <AttendancesCard shifts={shifts} />
          <AttendancesTableClient />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
