"use server"

import { prisma } from "@/_lib/prisma"

export async function getAttendancesByDate(date) {
  if (!date) return []

  const start = new Date(`${date}T00:00:00`)
  const end = new Date(`${date}T23:59:59`)

  const attendances = await prisma.attendance.findMany({
    where: { date: { gte: start, lte: end } },
    include: {
      user: { select: { id: true, name: true, email: true } },
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
  })

  return attendances
}