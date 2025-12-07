"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { determineAttendanceStatus, isUserWithinLocation } from "@/_function/helpers/attendanceHelpers"
import dayjs from "@/_lib/day"

export async function userSendCheckIn(currentCoords) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const today = dayjs().startOf("day").toDate()

  const shift = await prisma.shift.findUnique({ where: { id: user.shiftId },
    include: { division: true },
  })

  if (shift?.division?.type === "WFO") { const allowed = isUserWithinLocation(shift.division, currentCoords)
    if (!allowed) { return { error: "Kamu berada di luar jangkauan" }}
  }

  const status = await determineAttendanceStatus(user.shiftId)

  await prisma.attendance.upsert({
    where: {
      userId_shiftId_date: {
        userId: user.id, shiftId: user.shiftId ?? 0,
        date: today,
      },
    },
    update: {
      checkInTime: new Date(),
      status,
    },
    create: {
      userId: user.id, shiftId: user.shiftId ?? 0,
      date: today, status,
      checkInTime: new Date(),
    },
  })

  return { success: true }
}

export async function userSendCheckOut() {
  const user = await getCurrentUser()
  if (!user?.shiftId) return { error: "User tidak memiliki shift aktif" }

  const shift = await prisma.shift.findUnique({
    where: { id: user.shiftId },
    select: { endTime: true },
  })
  if (!shift) return { error: "Shift tidak ditemukan" }

  const now = dayjs()
  const shiftEnd = dayjs().startOf("day").add(shift.endTime, "minute")

  const diff = shiftEnd.diff(now, "minute")

  if (diff > 5) {
    return { error: `Belum waktunya checkout. Tunggu sampai ${shiftEnd.format("HH:mm")}.` }
  }

  await prisma.attendance.updateMany({
    where: { userId: user.id, checkOutTime: null },
    data: { checkOutTime: now.toDate() },
  })

  return { success: true }
}

export async function userSendPermissionRequest(reason) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const today = dayjs().startOf("day").toDate()

  await prisma.attendance.upsert({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId ?? 0,
        date: today,
      },
    },
    update: {
      status: "PERMISSION",
      approval: "PENDING",
      reason,
    },
    create: {
      userId: user.id,
      shiftId: user.shiftId ?? 0,
      date: today,
      status: "PERMISSION",
      approval: "PENDING",
      reason,
    },
  })

  return { success: true }
}

export async function userSendLeaveRequest({ startDate, endDate, reason }) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  if (!startDate || !endDate || !reason.trim()) {
    return { error: "Invalid input data" }
  }

  const start = dayjs(startDate).startOf("day").toDate()
  const end = dayjs(endDate).startOf("day").toDate()

  await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      startDate: start,
      endDate: end,
      reason,
      status: "PENDING",
    },
  })

  return { success: true }
}

export async function userSendEarlyCheckoutRequest(reason) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  if (!reason.trim()) {
    return { error: "Reason required" }
  }

  const today = dayjs().startOf("day").toDate()

  await prisma.earlyCheckoutRequest.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    update: {
      reason,
      status: "PENDING",
    },
    create: {
      userId: user.id,
      date: today,
      reason,
      status: "PENDING",
    },
  })

  return { success: true }
}