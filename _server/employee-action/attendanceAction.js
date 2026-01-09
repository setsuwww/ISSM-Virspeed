"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"

import {
  determineAttendanceStatus,
  evaluateAttendancePolicy,
  canUserCheckout,
} from "@/_function/helpers/attendanceHelpers"

import { getNowJakarta, getTodayStartJakarta } from "@/_lib/time"

export async function userPrecheckCheckIn() {
  const user = await getCurrentUser()
  if (!user?.shiftId) return { error: "Unauthorized" }

  const shift = await prisma.shift.findUnique({
    where: { id: user.shiftId },
    include: { division: true },
  })

  if (!shift?.division) {
    return { error: "Shift atau divisi tidak ditemukan" }
  }

  const policy = evaluateAttendancePolicy({ division: shift.division })

  return {
    requireLocation: policy.ignoreLocation !== true,
    toast: policy.toast,
  }
}

export async function userSendCheckIn(coords = null) {
  const user = await getCurrentUser()
  if (!user?.id || !user.shiftId) return { error: "Unauthorized" }

  const now = getNowJakarta()
  const today = getTodayStartJakarta().toDate()

  const shift = await prisma.shift.findUnique({
    where: { id: user.shiftId },
    include: { division: true },
  })

  if (!shift?.division) {
    return { error: "Shift atau divisi tidak ditemukan" }
  }

  const policy = evaluateAttendancePolicy({
    division: shift.division,
    currentCoords: coords,
  })

  if (!policy.allowed) {
    return { error: policy.message ?? "Check-in tidak diizinkan" }
  }

  const existing = await prisma.attendance.findUnique({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId,
        date: today,
      },
    },
  })

  if (existing?.checkInTime) {
    return { error: "Anda sudah check-in hari ini" }
  }

  let status
  try {
    status = await determineAttendanceStatus(user.shiftId)
  } catch (err) {
    return { error: err.message }
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId,
        date: today,
      },
    },
    create: {
      userId: user.id,
      shiftId: user.shiftId,
      date: today,
      status,
      checkInTime: now.toDate(),
      divisionType: shift.division.type,
      divisionStatus: shift.division.status,
    },
    update: {
      status,
      checkInTime: now.toDate(),
    },
  })

  return { success: true, attendance }
}

export async function userSendCheckOut() {
  const user = await getCurrentUser()
  if (!user?.shiftId) {
    return { error: "User tidak memiliki shift aktif" }
  }

  const allowed = await canUserCheckout(user.shiftId)
  if (!allowed) return { error: "Belum waktunya checkout" }

  const now = getNowJakarta()
  const today = getTodayStartJakarta().toDate() // ❗ FIX

  await prisma.attendance.updateMany({
    where: {
      userId: user.id,
      shiftId: user.shiftId,
      date: today,
      checkOutTime: null,
    },
    data: {
      checkOutTime: now.toDate(),
    },
  })

  return { success: true }
}

export async function userSendEarlyCheckout(reason) {
  const user = await getCurrentUser()
  if (!user?.shiftId) return { error: "Unauthorized" }
  if (!reason?.trim()) return { error: "Reason is required" }

  const today = getTodayStartJakarta().toDate()

  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId,
        date: today,
      },
    },
  })

  if (!attendance) return { error: "Attendance not found" }

  await prisma.earlyCheckoutRequest.create({
    data: {
      userId: user.id,
      attendanceId: attendance.id,
      reason,
    },
  })

  return { success: true }
}

export async function userSendPermissionRequest(reason) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  if (!reason?.trim()) return { error: "Reason is required" }

  const today = getTodayStartJakarta().toDate()

  await prisma.attendance.upsert({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId,
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
      shiftId: user.shiftId,
      date: today,
      status: "PERMISSION",
      approval: "PENDING",
      reason,
    },
  })

  return { success: true }
}

export async function userSendLeaveRequest({ type, startDate, endDate, reason }) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  if (!type || !startDate || !endDate) {
    return { error: "Invalid input data" }
  }

  const start = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)

  if (end < start) {
    return { error: "End date cannot be before start date" }
  }

  await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      type,
      startDate: start,
      endDate: end,
      reason: reason?.trim() || null,
      status: "PENDING",
    },
  })

  return { success: true }
}
