import { prisma } from "@/_lib/prisma"
import { getNowJakarta, minutesToTodayTime, MINUTE_MS } from "@/_lib/time"
import { addDays, isWeekend } from "date-fns"

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

  if (!shift?.startTime || !shift?.endTime) {
    return "PRESENT"
  }

  const now = getNowJakarta()

  const shiftStart = minutesToTodayTime(shift.startTime)

  const isCrossDay = shift.endTime < shift.startTime
  const shiftEnd = isCrossDay
    ? minutesToTodayTime(shift.endTime).add(1, "day")
    : minutesToTodayTime(shift.endTime)

  const diffMs = now.diff(shiftStart)

  // Terlalu awal
  if (diffMs < -CHECKIN_EARLY_WINDOW_MINUTES * MINUTE_MS) {
    throw new Error(
      `Belum waktu check-in. Maksimal ${CHECKIN_EARLY_WINDOW_MINUTES} menit sebelum shift.`
    )
  }

  // Sudah lewat
  if (now.isAfter(shiftEnd)) {
    throw new Error("Shift kamu sudah berakhir.")
  }

  // STATUS GENERATOR
  if (diffMs <= LATE_THRESHOLD_MINUTES * MINUTE_MS) return "PRESENT"
  if (diffMs <= ABSENT_THRESHOLD_MINUTES * MINUTE_MS) return "LATE"
  return "ABSENT"
}

export function isUserWithinLocation(division, currentCoords) {
  if (!division?.latitude || !division?.longitude) return false
  if (!currentCoords?.lat && !currentCoords?.latitude) return false

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
    return { allowed: false, save: false, message: "Division not found" }
  }

  if (division.status === "INACTIVE") {
    return {
      allowed: true,
      save: false,
      toast: "Check-in berhasil, namun divisi sedang nonaktif.",
    }
  }

  if (division.type === "WFA") {
    return { allowed: true, save: true, ignoreLocation: true }
  }

  if (division.type === "WFO") {
    const isValidLocation = isUserWithinLocation(division, currentCoords)

    if (!isValidLocation) {
      return {
        allowed: false,
        save: false,
        message: "Lokasi terlalu jauh dari kantor.",
      }
    }

    return { allowed: true, save: true, ignoreLocation: false }
  }

  return {
    allowed: false,
    save: false,
    message: "Konfigurasi divisi tidak valid",
  }
}

export function getDistanceMeters(pointA, pointB) {
  const earthRadius = 6371000
  const lat1 = (pointA.lat * Math.PI) / 180
  const lat2 = (pointB.lat * Math.PI) / 180
  const deltaLat = ((pointB.lat - pointA.lat) * Math.PI) / 180
  const deltaLon = ((pointB.lon - pointA.lon) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function canUserCheckout(shiftId) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    select: { startTime: true, endTime: true },
  })

  if (!shift?.startTime || !shift?.endTime) return false

  const now = getNowJakarta()

  const isCrossDay = shift.endTime < shift.startTime
  const shiftEnd = isCrossDay
    ? minutesToTodayTime(shift.endTime).add(1, "day")
    : minutesToTodayTime(shift.endTime)

  const diffMs = shiftEnd.diff(now)
  return diffMs <= CHECKOUT_EARLY_MARGIN_MINUTES * MINUTE_MS
}

export function shouldRemindForgotCheckout(attendance) {
  if (!attendance.checkInTime || attendance.checkOutTime) return false

  const checkIn = getNowJakarta(attendance.checkInTime)
  return (
    getNowJakarta().diff(checkIn) >=
    FORGOT_CHECKOUT_REMINDER_MINUTES * MINUTE_MS
  )
}

export function addWorkDays(startDate, days) {
  let date = new Date(startDate)
  let added = 0

  while (added < days) {
    date = addDays(date, 1)
    if (!isWeekend(date)) added++
  }

  return date
}

export function calculateWorkHours(checkIn, checkOut, breakHours = 1) {
  if (!checkIn || !checkOut) return 0

  const inTime = new Date(checkIn)
  const outTime = new Date(checkOut)

  let hours = (outTime - inTime) / (1000 * 60 * 60)
  hours -= breakHours

  return Number(Math.max(hours, 0).toFixed(2))
}

export function calculateWorkMinutes(
  checkInTime,
  checkOutTime
) {
  if (!checkInTime || !checkOutTime) return null;

  const diffMs = checkOutTime.getTime() - checkInTime.getTime();

  if (diffMs <= 0) return null;

  return Math.floor(diffMs / 60000);
}

export function formatWorkHours(minutes) {
  if (!minutes) return "-";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
}
