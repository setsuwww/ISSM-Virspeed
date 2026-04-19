"use server"

import { prisma } from "@/_lib/prisma"

const PAGE_SIZE = 10

function getJakartaRange(date) {
  const start = new Date(`${date}T00:00:00+07:00`)
  const end = new Date(`${date}T23:59:59.999+07:00`)
  return { start, end }
}

export async function getAttendancesByDate(date, page = 1, limit = 10) {
  if (!date) return { data: [], totalPages: 1 }

  const takeLimit = parseInt(limit, 10) || 10;
  const skipRecords = (parseInt(page, 10) - 1) * takeLimit;

  const { start, end } = getJakartaRange(date)

  const whereClause = {
    date: {
      gte: start,
      lte: end,
    },
  }

  const [attendances, total] = await Promise.all([
    prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        shift: {
          select: {
            id: true,
            name: true,
            type: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: { date: "desc" },
      skip: skipRecords,
      take: takeLimit,
    }),
    prisma.attendance.count({ where: whereClause }),
  ])

  const data = attendances.map((a) => ({
    ...a,
    workHours: a.workMinutes
      ? (a.workMinutes / 60).toFixed(2)
      : "0.00",
  }))

  return {
    data,
    totalPages: Math.max(Math.ceil(total / takeLimit), 1),
  }
}
