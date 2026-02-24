import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { AttendancesCard } from "./AttendancesCardStats"
import AttendancesTableClient from "./AttendancesTable"
import { Pagination } from "@/app/admin/dashboard/Pagination"

import { prisma } from "@/_lib/prisma"
import { minutesToTime } from "@/_functions/globalFunction"

const PAGE_SIZE = 10

async function getAttendancesByUserToday() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      userId: true,
      status: true,
      approval: true,
    },
  })

  return new Map(attendances.map((a) => [a.userId, a]))
}

async function getShifts(page) {
  const attendanceMap = await getAttendancesByUserToday()

  const whereClause = {
    type: {
      in: ["MORNING", "AFTERNOON", "EVENING"],
    },
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
        division: {
          select: {
            id: true,
            name: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            shift: {
              select: {
                type: true,
              },
            },
          },
        },
      },
    }),
  ])

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  const formatted = shifts.map((shift) => ({
    id: shift.id,
    name: shift.name,
    type: shift.type,
    divisionName: shift.division?.name ?? "-",
    startTime: minutesToTime(shift.startTime),
    endTime: minutesToTime(shift.endTime),

    users: shift.users.map((user) => {
      const attendance = attendanceMap.get(user.id)

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        shiftType: user.shift?.type ?? "Normal",
        attendanceStatus:
          attendance?.status &&
          ["ABSENT", "LATE", "PERMISSION"].includes(attendance.status)
            ? attendance.status
            : "PRESENT",
        approval: attendance?.approval ?? "",
      }
    }),
  }))

  return { data: formatted, totalPages }
}

export default async function AttendancesPage({ searchParams }) {
  const currentPage = Math.max(Number(searchParams?.page ?? "1"), 1)
  const page = Math.max(Number(searchParams?.page ?? "1"), 1)

  const { data: shifts, totalPages } = await getShifts(currentPage)

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

          {/* Client interactive table */}
          <AttendancesTableClient initialPage={page} />

          {/* Server pagination */}
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/admin/dashboard/attendances"
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
