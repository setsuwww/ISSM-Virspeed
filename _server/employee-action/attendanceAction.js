"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { determineAttendanceStatus } from "@/_function/helpers/attendanceHelpers"
import dayjs from "@/_lib/day"

import { evaluateAttendancePolicy } from "@/_function/helpers/attendanceHelpers"

export async function userSendCheckIn(currentCoords) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const shift = await prisma.shift.findUnique({
    where: { id: user.shiftId },
    include: { division: true },
  })

  if (!shift || !shift.division) {
    return { error: "Shift atau divisi tidak ditemukan" }
  }

  const division = shift.division

  if (!currentCoords) {
    const policy = evaluateAttendancePolicy({ division })

    return {
      success: true,
      requireLocation: policy.ignoreLocation !== true,
      toast: policy.toast,
      saved: false,
    }
  }

  const policy = evaluateAttendancePolicy({
    division,
    currentCoords,
  })

  if (!policy.allowed) {
    return { error: policy.message }
  }

  if (!policy.save) {
    return {
      success: true,
      toast: policy.toast,
      saved: false,
    }
  }

  const status = await determineAttendanceStatus(user.shiftId)

  const today = dayjs().startOf("day").toDate()

  await prisma.attendance.upsert({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId,
        date: today,
      },
    },
    update: {
      checkInTime: new Date(),
      status,
    },
    create: {
      userId: user.id,
      shiftId: user.shiftId,
      date: today,
      status,
      checkInTime: new Date(),
    },
  })

  return { success: true, saved: true }
}

export async function userSendEarlyCheckout(reason) {
  const user = await getCurrentUser()
  if (!user || !user.shiftId) return { error: "Unauthorized" }
  if (!reason.trim()) return { error: "Reason is required" }

  const today = dayjs().startOf("day").toDate()

  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId,
        date: today,
      },
    },
  })

  if (!attendance) {
    return { error: "Attendance not found" }
  }

  await prisma.earlyCheckoutRequest.create({
    data: {
      userId: user.id,
      attendanceId: attendance.id,
      reason,
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
