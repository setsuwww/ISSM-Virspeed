import { prisma } from "@/_lib/prisma"
import { getNowJakarta, minutesToTodayTime, minutesToDateTime, MINUTE_MS } from "@/_lib/time"
import { addDays, isWeekend } from "date-fns"

const LATE_THRESHOLD_MINUTES = 10
const ABSENT_THRESHOLD_MINUTES = 20
const CHECKIN_EARLY_WINDOW_MINUTES = 20
const CHECKOUT_EARLY_MARGIN_MINUTES = 5
const FORGOT_CHECKOUT_REMINDER_MINUTES = 20

export async function getActiveAssignment(userId) {
  const now = getNowJakarta()
  const today = now.startOf("day").toDate()
  const yesterday = now.subtract(1, "day").startOf("day").toDate()

  const assignments = await prisma.shiftAssignment.findMany({
    where: {
      userId,
      date: { in: [yesterday, today] },
    },
    include: {
      shift: {
        include: { location: true },
      },
    },
    orderBy: { date: "desc" },
  })

  let activeAssignment = null
  let fallbackAssignment = assignments.find(
    (a) => a.date.getTime() === today.getTime()
  )

  for (const asg of assignments) {
    if (!asg.shift) continue

    const shiftStart = minutesToDateTime(asg.date, asg.shift.startTime)
    const isCrossDay = asg.shift.endTime < asg.shift.startTime
    const shiftEnd = isCrossDay
      ? minutesToDateTime(asg.date, asg.shift.endTime).add(1, "day")
      : minutesToDateTime(asg.date, asg.shift.endTime)

    if (
      now.isAfter(shiftStart.subtract(120, "minute")) &&
      now.isBefore(shiftEnd.add(120, "minute"))
    ) {
      activeAssignment = asg
      break
    }
  }

  return activeAssignment || fallbackAssignment
}

export async function determineAttendanceStatus(shiftId, assignmentDate = new Date()) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    select: { startTime: true, endTime: true },
  })

  if (!shift?.startTime || !shift?.endTime) {
    return "PRESENT"
  }

  const now = getNowJakarta()

  const shiftStart = minutesToDateTime(assignmentDate, shift.startTime)

  const isCrossDay = shift.endTime < shift.startTime
  const shiftEnd = isCrossDay
    ? minutesToDateTime(assignmentDate, shift.endTime).add(1, "day")
    : minutesToDateTime(assignmentDate, shift.endTime)

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

export function isUserWithinLocation(location, currentCoords) {
  if (!location?.latitude || !location?.longitude) return false
  if (!currentCoords?.lat && !currentCoords?.latitude) return false

  const userLat = currentCoords.lat ?? currentCoords.latitude
  const userLon = currentCoords.lon ?? currentCoords.longitude

  const distance = getDistanceMeters(
    { lat: location.latitude, lon: location.longitude },
    { lat: userLat, lon: userLon }
  )

  return distance <= location.radius
}

export function evaluateAttendancePolicy({ location, currentCoords }) {
  if (!location) {
    return { allowed: false, save: false, message: "Location not found" }
  }

  if (location.status === "INACTIVE") {
    return {
      allowed: true,
      save: false,
      toast: "Check-in berhasil, namun divisi sedang nonaktif.",
    }
  }

  if (location.type === "WFA") {
    return { allowed: true, save: true, ignoreLocation: true }
  }

  if (location.type === "WFO") {
    const isValidLocation = isUserWithinLocation(location, currentCoords)

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

export async function isEarlyCheckout(shiftId, checkoutTime, assignmentDate = new Date()) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    select: { startTime: true, endTime: true },
  });

  if (!shift?.endTime) return false;

  const isCrossDay = shift.endTime < shift.startTime;
  const shiftEnd = isCrossDay
    ? minutesToDateTime(assignmentDate, shift.endTime).add(1, "day")
    : minutesToDateTime(assignmentDate, shift.endTime);

  const checkout = getNowJakarta(checkoutTime);

  return checkout.isBefore(shiftEnd);
}

export async function canUserCheckout(shiftId, assignmentDate = new Date()) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    select: { startTime: true, endTime: true },
  })

  if (!shift?.startTime || !shift?.endTime) return false

  const now = getNowJakarta()

  const isCrossDay = shift.endTime < shift.startTime
  const shiftEnd = isCrossDay
    ? minutesToDateTime(assignmentDate, shift.endTime).add(1, "day")
    : minutesToDateTime(assignmentDate, shift.endTime)

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

export function calculateWorkMinutes(checkInTime, checkOutTime) {
  if (!checkInTime || !checkOutTime) return null;
  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  if (diffMs <= 0) return null;
  return Math.floor(diffMs / 60000); // presisi menit
}

export function calculateWorkHours(
  checkInTime,
  checkOutTime
) {
  const minutes = calculateWorkMinutes(checkInTime, checkOutTime);
  if (minutes == null) return null;

  return Number((minutes / 60).toFixed(2));
}

export function formatWorkHours(minutes) {
  if (minutes == null) return "-";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
}
