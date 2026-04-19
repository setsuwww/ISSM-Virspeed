import { prisma } from "@/_lib/prisma"

const SHIFT_PATTERN = [
  "MORNING",
  "AFTERNOON",
  "EVENING",
  "OFF",
]

function normalizeDate(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function buildShiftDateTime(baseDate, start, end) {
  const workStart = new Date(baseDate)
  workStart.setHours(start, 0, 0, 0)

  const workEnd = new Date(baseDate)
  workEnd.setHours(end, 0, 0, 0)

  // cross-day handling
  if (end <= start) {
    workEnd.setDate(workEnd.getDate() + 1)
  }

  return { workStart, workEnd }
}

export async function generateShiftSchedule({
  userId,
  startDate,
  totalDays = 30,
  startFrom = "MORNING",
}) {
  const baseDate = normalizeDate(startDate)

  const shifts = await prisma.shift.findMany({
    where: { isActive: true },
  })

  // indexing O(1)
  const shiftMap = new Map(shifts.map((s) => [s.type, s]))

  const startIndex = SHIFT_PATTERN.indexOf(startFrom)

  if (startIndex === -1) {
    throw new Error("Invalid startFrom shift")
  }

  const assignments = []

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(baseDate)
    currentDate.setDate(baseDate.getDate() + i)

    const patternIndex = (startIndex + i) % SHIFT_PATTERN.length
    const shiftType = SHIFT_PATTERN[patternIndex]

    const shift = shiftMap.get(shiftType)

    let workStart = null
    let workEnd = null

    if (shift) {
      const built = buildShiftDateTime(
        currentDate,
        shift.startTime,
        shift.endTime
      )

      workStart = built.workStart
      workEnd = built.workEnd
    }

    assignments.push({
      userId,
      date: currentDate,
      shiftId: shift ? shift.id : null,
      workStart,
      workEnd,
    })
  }

  return prisma.shiftAssignment.createMany({
    data: assignments,
    skipDuplicates: true,
  })
}

export async function getCurrentShift(userId) {
  const now = new Date()

  return prisma.shiftAssignment.findFirst({
    where: {
      userId,
      workStart: { lte: now },
      workEnd: { gte: now },
    },
    include: { shift: true },
  })
}

export async function generateBulkSchedule({
  userIds,
  startDate,
  totalDays = 30,
}) {
  return Promise.all(
    userIds.map((userId, idx) => {
      const startFrom = SHIFT_PATTERN[idx % SHIFT_PATTERN.length]

      return generateShiftSchedule({
        userId,
        startDate,
        totalDays,
        startFrom,
      })
    })
  )
}
