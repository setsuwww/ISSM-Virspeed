import dayjs from "@/_lib/day"
import { prisma } from "@/_lib/prisma"

const LATE_THRESHOLD_MINUTES = 10
const ABSENT_THRESHOLD_MINUTES = 20
const CHECKIN_EARLY_WINDOW_MINUTES = 20
const CHECKOUT_EARLY_MARGIN_MINUTES = 5
const FORGOT_CHECKOUT_REMINDER_MINUTES = 20

export async function determineAttendanceStatus(shiftId) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    select: { startTime: true, endTime: true },
  })
  if (!shift || shift.startTime == null) return "PRESENT"

  const now = dayjs()
  const startToday = dayjs().startOf("day").add(shift.startTime, "minute")

  const isCrossDay = shift.endTime < shift.startTime
  const shiftStart = startToday
  const shiftEnd = isCrossDay ? startToday.add(1, "day").add(shift.endTime, "minute") : startToday.add(shift.endTime - shift.startTime, "minute")

  const diff = now.diff(shiftStart, "minute")

  if (diff < -CHECKIN_EARLY_WINDOW_MINUTES) {
    throw new Error("Belum waktu untuk check-in. Tunggu hingga 20 menit sebelum shift dimulai.")
  }

  if (now.isAfter(shiftEnd)) {
    throw new Error("Shift kamu sudah berakhir, tidak bisa check-in lagi.")
  }

  if (diff <= LATE_THRESHOLD_MINUTES) return "PRESENT"
  if (diff <= ABSENT_THRESHOLD_MINUTES) return "LATE"
  return "ABSENT"
}

export function isUserWithinLocation(division, currentCoords) {
  if (!division?.latitude || !division?.longitude) return false
  if (!currentCoords?.lat && !currentCoords?.latitude) {
    return false
  }

  const userLat = currentCoords.lat ?? currentCoords.latitude
  const userLon = currentCoords.lon ?? currentCoords.longitude

  const distance = getDistanceMeters(
    { lat: division.latitude, lon: division.longitude },
    { lat: userLat, lon: userLon }
  )

  return distance <= division.radius
}

export function evaluateAttendancePolicy({ division, currentCoords }) {
  if (!division) {
    return {
      allowed: false,
      save: false,
      message: "Division not found",
    }
  }

  if (division.status === "INACTIVE") {
    return {
      allowed: true,
      save: false,
      toast: "Success send Checkin, but you're division is off already.",
    }
  }

  if (division.type === "WFA") {
    return {
      allowed: true,
      save: true,
      ignoreLocation: true,
    }
  }

  if (division.type === "WFO") {
    const isValidLocation = isUserWithinLocation(division, currentCoords)

    if (!isValidLocation) {
      return {
        allowed: false,
        save: false,
        message: "You're so far from office or place your work, get closer and retry to send",
      }
    }

    return {
      allowed: true,
      save: true,
      ignoreLocation: false,
    }
  }

  return {
    allowed: false,
    save: false,
    message: "Konfigurasi divisi tidak valid",
  }
}

export function getDistanceMeters(pointA, pointB) {
  const earthRadius = 6371000 // meter
  const lat1 = (pointA.lat * Math.PI) / 180
  const lat2 = (pointB.lat * Math.PI) / 180
  const deltaLat = ((pointB.lat - pointA.lat) * Math.PI) / 180
  const deltaLon = ((pointB.lon - pointA.lon) * Math.PI) / 180

  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

export async function canUserCheckout(shiftId) {
  const shift = await prisma.shift.findUnique({ where: { id: shiftId },
    select: { endTime: true, startTime: true },
  })
  if (!shift || shift.endTime == null) return false

  const now = dayjs()
  const startToday = dayjs().startOf("day").add(shift.startTime, "minute")

  const isCrossDay = shift.endTime < shift.startTime
  const endTime = isCrossDay
    ? startToday.add(1, "day").add(shift.endTime, "minute")
    : startToday.add(shift.endTime, "minute")

  const diff = endTime.diff(now, "minute")
  return diff <= CHECKOUT_EARLY_MARGIN_MINUTES
}

export function shouldRemindForgotCheckout(attendance) {
  if (!attendance.checkInTime || attendance.checkOutTime) return false
  const checkIn = dayjs(attendance.checkInTime)
  return dayjs().diff(checkIn, "minute") >= FORGOT_CHECKOUT_REMINDER_MINUTES
}

export function calculateWorkHours(checkIn, checkOut, breakHours = 1) {
  if (!checkIn || !checkOut) return 0

  const inTime = new Date(checkIn)
  const outTime = new Date(checkOut)

  let diff = (outTime - inTime) / (1000 * 60 * 60)
  diff -= breakHours

  if (diff < 0) diff = 0

  return Number(diff.toFixed(2))
}

