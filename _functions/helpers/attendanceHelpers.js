"use server";

import { prisma } from "@/_lib/prisma"
import { getNowJakarta, minutesToTodayTime, minutesToDateTime, MINUTE_MS, getTodayStartJakarta } from "@/_lib/time"
import { addDays, isWeekend } from "date-fns"
import { getCurrentUser } from "@/_lib/auth";
import { LogAction, LogMethod } from "@prisma/client";
import { safeLog } from "@/_servers/admin-services/log_action";
import { pusherServer } from "@/_lib/pusher";

const LATE_THRESHOLD_MINUTES = 10
const ABSENT_THRESHOLD_MINUTES = 20
const CHECKIN_EARLY_WINDOW_MINUTES = 20
const CHECKOUT_EARLY_MARGIN_MINUTES = 5
const FORGOT_CHECKOUT_REMINDER_MINUTES = 20

function calculateShiftEndTime(date, shift) {
  const shiftEndHour = shift.endTime;
  const shiftEndMinute = 0;

  const shiftEnd = new Date(date);
  shiftEnd.setHours(shiftEndHour, shiftEndMinute, 0, 0);

  if (shift.endTime < shift.startTime) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  return shiftEnd;
}

// Handle absensi beda hari (shift malam)
export async function determineAttendanceStatus(shiftId, assignmentDate) {
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

export async function isUserWithinLocation(location, currentCoords) {
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

export async function evaluateAttendancePolicy({ location, currentCoords }) {
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

export async function getDistanceMeters(pointA, pointB) {
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

export async function shouldRemindForgotCheckout(attendance) {
  if (!attendance.checkInTime || attendance.checkOutTime) return false

  const checkIn = getNowJakarta(attendance.checkInTime)
  return (
    getNowJakarta().diff(checkIn) >=
    FORGOT_CHECKOUT_REMINDER_MINUTES * MINUTE_MS
  )
}

export async function checkForgotCheckoutStatus() {
  const user = await getCurrentUser();
  if (!user?.id) return { hasForgotCheckout: false };

  const now = getNowJakarta();

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      checkInTime: { not: null },
      checkOutTime: null,
    },
    include: {
      shift: true,
    },
    orderBy: { date: "desc" },
  });

  if (!attendance || !attendance.shift) {
    return { hasForgotCheckout: false };
  }

  // Hitung waktu akhir shift
  const shiftEndTime = calculateShiftEndTime(attendance.date, attendance.shift);

  // Tambah tolerance 2 jam
  const toleranceTime = new Date(shiftEndTime);
  toleranceTime.setHours(toleranceTime.getHours() + 2);

  const isForgot = now.toDate() > toleranceTime;

  // Hitung menit terlambat untuk warning
  let lateMinutes = 0;
  if (now.toDate() > shiftEndTime) {
    const diffMs = now.toDate().getTime() - shiftEndTime.getTime();
    lateMinutes = Math.floor(diffMs / 60000);
  }

  return {
    hasForgotCheckout: isForgot,
    attendanceId: attendance.id,
    shiftEndTime: shiftEndTime.toISOString(),
    lateMinutes,
    isShiftEnded: now.toDate() > shiftEndTime,
  };
}

export async function autoCheckoutUser(attendanceId) {
  const user = await getCurrentUser();
  if (!user?.id) return { success: false, message: "Unauthorized" };

  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { shift: true },
    });

    if (!attendance) {
      return { success: false, message: "Attendance not found" };
    }

    if (attendance.checkOutTime) {
      return { success: false, message: "Already checked out" };
    }

    // Hitung waktu checkout berdasarkan akhir shift + 2 jam
    const shiftEndTime = calculateShiftEndTime(attendance.date, attendance.shift);
    const autoCheckoutTime = new Date(shiftEndTime);
    autoCheckoutTime.setHours(autoCheckoutTime.getHours() + 2);

    // Hitung work minutes
    const workMinutes = calculateWorkMinutes(
      attendance.checkInTime,
      autoCheckoutTime
    );

    // Update attendance dengan auto checkout
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOutTime: autoCheckoutTime,
        workMinutes: workMinutes || 0,
      },
    });

    // Log auto checkout
    await safeLog({
      userId: user.id,
      url: "/employee/attendance/auto-checkout",
      action: LogAction.UPDATE,
      method: LogMethod.PUT,
      data: {
        attendanceId,
        autoCheckoutTime: autoCheckoutTime.toISOString(),
        reason: "forgot_checkout_auto",
        workMinutes,
      },
    });

    // Notifikasi ke admin via Pusher
    await pusherServer.trigger("admin-channel", "auto-checkout", {
      userId: user.id,
      userName: user.name,
      attendanceId,
      autoCheckoutTime: autoCheckoutTime.toISOString(),
    });

    return {
      success: true,
      message: "Auto checkout berhasil",
      attendanceId: updatedAttendance.id
    };
  } catch (error) {
    console.error("Auto checkout error:", error);
    return { success: false, message: "Gagal melakukan auto checkout" };
  }
}

export async function batchAutoCheckout() {
  const now = getNowJakarta();

  const forgotCheckouts = await prisma.attendance.findMany({
    where: {
      checkInTime: { not: null },
      checkOutTime: null,
    },
    include: {
      shift: true,
      user: true,
    },
  });

  const results = [];

  for (const attendance of forgotCheckouts) {
    if (!attendance.shift) continue;

    const shiftEndTime = calculateShiftEndTime(attendance.date, attendance.shift);
    const toleranceTime = new Date(shiftEndTime);
    toleranceTime.setHours(toleranceTime.getHours() + 2);

    // Jika sudah melewati tolerance time
    if (now.toDate() > toleranceTime) {
      const autoCheckoutTime = toleranceTime;
      const workMinutes = calculateWorkMinutes(
        attendance.checkInTime,
        autoCheckoutTime
      );

      const result = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOutTime: autoCheckoutTime,
          workMinutes: workMinutes || 0,
        },
      });

      results.push({
        userId: attendance.userId,
        attendanceId: attendance.id,
        autoCheckoutTime: autoCheckoutTime.toISOString(),
      });

      // Log untuk admin
      await safeLog({
        userId: attendance.userId,
        url: "/system/batch-auto-checkout",
        action: LogAction.UPDATE,
        method: LogMethod.PUT,
        data: {
          attendanceId: attendance.id,
          autoCheckoutTime: autoCheckoutTime.toISOString(),
          reason: "batch_auto_checkout",
        },
      });
    }
  }

  return { processed: results.length, results };
}

export async function getForgotCheckoutWarning(lateMinutes, isShiftEnded) {
  if (!isShiftEnded) return null;

  if (lateMinutes >= 120) {
    return "⚠️ Anda telah melebihi 2 jam dari waktu akhir shift. Sistem akan melakukan auto checkout.";
  } else if (lateMinutes >= 60) {
    return `⚠️ Anda sudah terlambat checkout ${lateMinutes} menit. Segera lakukan checkout untuk menghindari auto checkout dalam ${120 - lateMinutes} menit.`;
  } else if (lateMinutes >= 30) {
    return `⚠️ Waktu shift sudah berakhir ${lateMinutes} menit yang lalu. Jangan lupa checkout!`;
  } else if (lateMinutes >= 1) {
    return `⚠️ Shift sudah berakhir. Mohon segera checkout.`;
  }

  return null;
}

export async function isForgotCheckoutEligible(attendance, shift) {
  if (!attendance.checkInTime || attendance.checkOutTime) return false;

  const shiftEndTime = calculateShiftEndTime(attendance.date, shift);
  const now = getNowJakarta();
  const twoHoursAfterShift = new Date(shiftEndTime);
  twoHoursAfterShift.setHours(twoHoursAfterShift.getHours() + 2);

  return now.toDate() > twoHoursAfterShift;
}

export async function getForgotCheckoutDeadline(attendance, shift) {
  if (!attendance.checkInTime || attendance.checkOutTime) return null;

  const shiftEndTime = calculateShiftEndTime(attendance.date, shift);
  const deadline = new Date(shiftEndTime);
  deadline.setHours(deadline.getHours() + 2);

  return deadline;
}

export async function addWorkDays(startDate, days) {
  let date = new Date(startDate)
  let added = 0

  while (added < days) {
    date = addDays(date, 1)
    if (!isWeekend(date)) added++
  }

  return date
}

export async function calculateWorkMinutes(checkInTime, checkOutTime) {
  if (!checkInTime || !checkOutTime) return null;
  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  if (diffMs <= 0) return null;
  return Math.floor(diffMs / 60000); // presisi menit
}

export async function calculateWorkHours(
  checkInTime,
  checkOutTime
) {
  const minutes = calculateWorkMinutes(checkInTime, checkOutTime);
  if (minutes == null) return null;

  return Number((minutes / 60).toFixed(2));
}

export async function formatWorkHours(minutes) {
  if (minutes == null) return "-";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
}

export async function getActiveAssignment(userId) {
  const today = getTodayStartJakarta().toDate();

  return prisma.shiftAssignment.findFirst({
    where: {
      userId,
      date: today,
    },
    include: {
      shift: {
        include: { location: true }
      }
    }
  });
}
