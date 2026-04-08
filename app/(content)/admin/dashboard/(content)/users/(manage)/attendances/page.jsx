import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { AttendancesCard } from "./AttendancesCardStats"
import AttendancesTableClient from "./AttendancesTable"
import { Pagination } from "@/app/(content)/admin/dashboard/Pagination"

import { prisma } from "@/_lib/prisma"
import { getAttendancesByDate } from "@/_servers/admin-action/attendanceAction"

const PAGE_SIZE = 10

async function getShiftsWithWorkMinutes(page) {
  const currentDate = new Date().toISOString().split("T")[0]

  // Panggil server action
  const { data: attendancesToday } = await getAttendancesByDate(currentDate, page)

  const whereClause = {
    type: { in: ["MORNING", "AFTERNOON", "EVENING"] },
  }

  const [total, shifts] = await Promise.all([
    prisma.shift.count({ where: whereClause }),
    prisma.shift.findMany({
      where: whereClause,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        startTime: true,
        endTime: true,
        location: { select: { id: true, name: true } },
        users: { select: { id: true, name: true, email: true, shift: { select: { type: true } } } },
      },
    }),
  ])

  const attendanceMap = new Map(attendancesToday.map(a => [a.userId, a]))

  const formatted = shifts.map(shift => ({
    id: shift.id,
    name: shift.name,
    type: shift.type,
    locationName: shift.location?.name ?? "-",
    startTime: shift.startTime,
    endTime: shift.endTime,
    users: shift.users.map(user => {
      const attendance = attendanceMap.get(user.id)
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        shiftType: user.shift?.type ?? "Normal",
        attendanceStatus: attendance?.status ?? "PRESENT",
        approval: attendance?.approval ?? "",
        workMinutes: attendance?.workMinutes ?? 0, // <= field utama
      }
    }),
  }))

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)
  return { data: formatted, totalPages }
}

export default async function AttendancesPage({ searchParams }) {
  const currentPage = Math.max(Number(searchParams?.page ?? "1"), 1)
  const page = currentPage

  const { data: shifts, totalPages } = await getShiftsWithWorkMinutes(currentPage)

  return (
    <section className="space-y-6">
      <DashboardHeader
        title="Attendances"
        subtitle="Employees attendance records"
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            title="Shift attendance"
            subtitle="View employees attendance today"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <AttendancesCard shifts={shifts} />

          <AttendancesTableClient initialPage={page} shifts={shifts} />

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/admin/dashboard/users/attendances"
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
