"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { LogAction, LogMethod } from "@prisma/client"

import {
  evaluateAttendancePolicy,
  processPermissionRequest,
  processLeaveRequest,
  getCheckoutWarning,
  determineAttendanceStatus,
  isForgotCheckoutEligible,
  resolveCheckInStatus,
  resolveCheckOutStatus,
  getAttendanceLabel,
} from "@/_functions/helpers/attendanceServerHelpers"

import { getNowJakarta, getTodayStartJakarta, minutesToDateTime } from "@/_lib/time"
import { safeLog } from "@/_servers/admin-services/log_action"
import { pusherServer } from "@/_lib/pusher"

import { calculateWorkMinutes } from "@/_functions/helpers/calculateShift"
import { getActiveShiftAssignment } from "@/_jobs/content/shift/shift_generator"
import { revalidatePath } from "next/cache"

const normalizeMinutes = (minutes) => {
  return minutes === 1440 ? 0 : minutes;
};

export async function handleForgotCheckoutAuto(userId) {
  if (!userId) return null;

  const now = getNowJakarta();

  // Find latest attendance that hasn't checked out
  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: userId,
      checkInTime: { not: null },
      checkOutTime: null,
    },
    include: {
      shift: true,
      assignment: { include: { shift: true } },
    },
    orderBy: { date: "desc" },
  });

  if (!attendance) return null;

  const workHours = attendance.shift || attendance.assignment?.shift;
  if (!workHours) return null;

  const shiftEnd = minutesToDateTime(attendance.date, workHours.endTime);
  const isCrossDay = workHours.endTime < workHours.startTime;
  const finalEnd = isCrossDay ? shiftEnd.add(1, "day") : shiftEnd;

  // Tolerance 20 minutes after shift end
  const toleranceLimit = finalEnd.clone().add(20, "minutes");

  if (now.isAfter(toleranceLimit)) {
    const autoCheckoutTime = toleranceLimit.toDate();
    const workMinutes = calculateWorkMinutes(attendance.checkInTime, autoCheckoutTime);

    // Resolve combined status for compatibility
    const checkOutStatus = "FORGOT_CHECKOUT";
    const finalStatus = "FORGOT_CHECKOUT";

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: autoCheckoutTime,
        status: finalStatus,
        checkOutStatus: checkOutStatus,
        workMinutes: workMinutes || 0,
      },
    });

    console.log(`[Auto-Checkout] User ${userId} handled for attendance ${attendance.id}`);
    return updated;
  }

  return null;
}

export async function handleAutoAbsent(userId) {
  if (!userId) return null;

  const now = getNowJakarta();
  const assignment = await getActiveShiftAssignment(userId);
  if (!assignment || !assignment.shiftId) return null;

  const workHours = assignment.shift;
  const startMinutes = normalizeMinutes(workHours.startTime);
  const shiftStart = minutesToDateTime(assignment.date, startMinutes);

  // ABSENT threshold: 30 minutes after start
  const absentLimit = shiftStart.clone().add(30, "minutes");

  if (now.isAfter(absentLimit)) {
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: assignment.date,
      }
    });

    if (!attendance) {
      // If no attendance record at all, check for leave/permission
      // If assignment.isLeave is true, it might already be handled by another system
      // but here we ensure consistency
      const status = assignment.isLeave ? "LEAVE" : "ABSENT";
      const checkInStatus = assignment.isLeave ? "LEAVE" : "ABSENT";

      await prisma.attendance.create({
        data: {
          userId,
          assignmentId: assignment.id,
          shiftId: assignment.shiftId,
          date: assignment.date,
          status,
          checkInStatus,
        }
      });
      console.log(`[Auto-Absent] User ${userId} marked as ${status} for ${assignment.date}`);
    } else if (!attendance.checkInTime && attendance.status !== "ABSENT" && attendance.status !== "LEAVE" && attendance.status !== "PERMISSION") {
      await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          status: "ABSENT",
          checkInStatus: "ABSENT"
        }
      });
      console.log(`[Auto-Absent] User ${userId} updated to ABSENT for ${assignment.date}`);
    }
  }
}

export async function userPrecheckCheckIn() {
  const user = await getCurrentUser()
  if (!user?.id) return { error: "Unauthorized" }

  // 1. Auto-handle forgotten checkouts and absents
  await handleAutoAbsent(user.id);
  await handleForgotCheckoutAuto(user.id);

  const now = getNowJakarta()
  const assignment = await getActiveShiftAssignment(user.id)

  let shift = assignment?.shift;
  let workHours = null;
  let location = null;
  let date = assignment?.date || getTodayStartJakarta().toDate();

  if (shift) {
    workHours = shift;
    location = shift.location;
  }

  if (!workHours) {
    return {
      requireLocation: false,
      checkIn: { disabled: true, reason: "Hari ini OFF / Tidak ada jadwal" },
      checkOut: { disabled: true, reason: "Hari ini OFF / Tidak ada jadwal" },
    }
  }

  const startMinutes = normalizeMinutes(workHours.startTime)
  const endMinutes = normalizeMinutes(workHours.endTime)

  let shiftStart = minutesToDateTime(date, startMinutes)
  let shiftEnd = minutesToDateTime(date, endMinutes)

  if (endMinutes <= startMinutes) {
    shiftEnd = shiftEnd.add(1, "day")
  }

  // 🔥 FIX KRITIS: kalau sekarang sebelum end tapi setelah midnight,
  // berarti shiftStart harus mundur 1 hari
  if (now.isBefore(shiftStart) && now.isBefore(shiftEnd)) {
    const prevStart = shiftStart.subtract(1, "day")
    const prevEnd = shiftEnd.subtract(1, "day")

    if (now.isAfter(prevStart) && now.isBefore(prevEnd)) {
      shiftStart = prevStart
      shiftEnd = prevEnd
    }
  }

  const isShiftEnded = now.isAfter(shiftEnd)

  const diffStartMin = shiftStart.diff(now) / (60 * 1000)

  const isCheckInOpen = now.isAfter(shiftStart.subtract(20, "minute")) && now.isBefore(shiftEnd)
  const isShiny = now.isAfter(shiftStart.subtract(10, "minute")) && now.isBefore(shiftStart)

  // Check Attendance
  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      date: date,
    },
    include: { earlyCheckoutRequests: true }
  })

  const hasRequest = attendance?.status === "PERMISSION" || attendance?.status === "LEAVE" || attendance?.status === "INACTIVE"

  const hasEarlyCheckoutReq = attendance?.earlyCheckoutRequests?.some(r => r.status === "PENDING" || r.status === "APPROVED")

  const checkInState = {
    disabled: isShiftEnded || !isCheckInOpen || !!attendance?.checkOutTime || !!attendance?.checkInTime || hasRequest || user.isActive === false,
    isShiny: isShiny && !attendance?.checkInTime,
    reason: isShiftEnded ? "Shift ended" : !isCheckInOpen ? "Not opened" : attendance?.checkInTime ? "Already checked-in" : null
  }

  const checkOutState = {
    disabled: isShiftEnded || !attendance?.checkInTime || !!attendance?.checkOutTime || hasEarlyCheckoutReq || hasRequest || user.isActive === false,
    isForgot: isForgotCheckoutEligible(attendance, workHours) && !isShiftEnded,
    isEarly: !isShiftEnded,
    reason: !attendance?.checkInTime ? "Not checked-in" : attendance?.checkOutTime ? "Already checked-out" : null
  }

  const policy = await evaluateAttendancePolicy({
    location: workHours?.location,
  });

  return {
    requireLocation: policy.ignoreLocation !== true,
    toast: policy.toast,
    checkIn: checkInState,
    checkOut: checkOutState,
  }
}

export async function userSendCheckIn(coords = null) {
  const user = await getCurrentUser();
  if (!user?.id) return { error: "Unauthorized" };

  const now = getNowJakarta();
  const assignment = await getActiveShiftAssignment(user.id);

  if (!assignment || !assignment.shiftId) {
    return { error: "Hari ini OFF" }
  }

  let shift = assignment?.shift;
  let workHours = null;
  let location = null;
  let date = assignment?.date || getTodayStartJakarta().toDate();

  if (shift) {
    workHours = shift;
    location = shift.location;
  }

  if (!workHours) {
    return { error: "Hari ini OFF / Tidak ada jadwal" };
  }

  // Policy Location & coordinates
  const policy = await evaluateAttendancePolicy({
    location: workHours?.location,
    currentCoords: coords,
  });

  if (!policy.allowed) {
    return { error: policy.message ?? "Check-in tidak diizinkan" };
  }

  // Attendance check
  const existing = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      date: date,
    },
  });

  if (existing?.checkInTime) {
    return { error: "Sudah check-in" };
  }

  const startMinutes = normalizeMinutes(workHours.startTime);
  const endMinutes = normalizeMinutes(workHours.endTime);

  let shiftStart = minutesToDateTime(date, startMinutes);
  let shiftEnd = minutesToDateTime(date, endMinutes);

  if (endMinutes <= startMinutes) {
    shiftEnd = shiftEnd.add(1, "day");
  }

  // 🔥 FIX KRITIS: handle overnight shift when checking in after midnight
  if (now.isBefore(shiftStart) && now.isBefore(shiftEnd)) {
    const prevStart = shiftStart.subtract(1, "day");
    const prevEnd = shiftEnd.subtract(1, "day");

    if (now.isAfter(prevStart) && now.isBefore(prevEnd)) {
      shiftStart = prevStart;
      shiftEnd = prevEnd;
    }
  }

  const checkInStatus = resolveCheckInStatus(now.toDate(), shiftStart.toDate(), shiftEnd.toDate());

  if (!checkInStatus && now.isBefore(shiftStart)) {
    return { error: "Terlalu awal untuk check-in. (Batas: 20 menit sebelum shift)" };
  }

  if (now.isAfter(shiftEnd)) {
    return { error: "Shift untuk hari ini sudah berakhir." };
  }
  
  // Status mapping for backward compatibility
  let status = checkInStatus;
  if (!user.isActive) status = "INACTIVE";

  const attendance = await prisma.attendance.upsert({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: shift?.id,
        date: date
      }
    },
    update: {
      status,
      checkInStatus,
      checkInTime: now.toDate(),
      locationType: location.type,
      locationStatus: location.status,
    },
    create: {
      userId: user.id,
      assignmentId: assignment.id,
      shiftId: shift?.id,
      date: date,
      status,
      checkInStatus,
      checkInTime: now.toDate(),
      locationType: location.type,
      locationStatus: location.status,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      inactiveUntil: null
    }
  });

  await safeLog({
    userId: user.id,
    url: "/employee/attendance/check-in",
    action: LogAction.SUBMIT,
    method: LogMethod.POST,
    data: { attendanceId: attendance.id, status, checkInStatus },
  });

  revalidatePath("/employee/dashboard/attendance/main")

  return { success: true, attendance };
}

export async function userSendCheckOut() {
  const user = await getCurrentUser();
  if (!user?.id) return { error: "Unauthorized" };

  const now = getNowJakarta();

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      checkInTime: { not: null },
      checkOutTime: null,
    },
    include: {
      shift: { include: { location: true } },
      assignment: { include: { shift: { include: { location: true } } } },
      earlyCheckoutRequests: {
        where: { status: "APPROVED" }
      }
    },
    orderBy: { date: "desc" },
  });

  if (!attendance) {
    return { error: "Belum check-in atau sudah checkout" };
  }

  const checkoutTime = now.toDate();

  let workHours = attendance.shift || attendance.assignment?.shift;

  if (!workHours) {
    return { error: "Jadwal kerja tidak ditemukan" };
  }

  const startMinutes = normalizeMinutes(workHours.startTime);
  const endMinutes = normalizeMinutes(workHours.endTime);

  const shiftStart = minutesToDateTime(attendance.date, startMinutes);
  const shiftEnd = minutesToDateTime(attendance.date, endMinutes);
  const isCrossDay = endMinutes < startMinutes;
  const finalEnd = isCrossDay ? shiftEnd.add(1, "day") : shiftEnd;

  const warning = getCheckoutWarning(finalEnd, now);

  const workMinutes = calculateWorkMinutes(
    attendance.checkInTime,
    checkoutTime
  );

  if (workMinutes == null) {
    return { error: "Invalid checkout" };
  }

  const hasEarlyRequest = attendance.earlyCheckoutRequests.length > 0;
  const checkOutStatus = resolveCheckOutStatus(checkoutTime, finalEnd.toDate(), hasEarlyRequest);
  
  // Combined status for compatibility
  let status = attendance.status;
  if (checkOutStatus === "EARLY_CHECKOUT") status = "EARLY_CHECKOUT";
  else if (checkOutStatus === "FORGOT_CHECKOUT") status = "FORGOT_CHECKOUT";
  else if (checkOutStatus === "OVERTIME") status = "OVERTIME";

  await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOutTime: checkoutTime,
      workMinutes,
      checkOutStatus,
      status
    },
  });

  revalidatePath("/employee/dashboard/attendance/main")

  return { success: true, warning };
}

export async function userForgotCheckout() {
  const user = await getCurrentUser();
  if (!user?.id) return null;

  const now = getNowJakarta();

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      checkInTime: { not: null },
      checkOutTime: null,
    },
    include: {
      shift: { include: { location: true } },
      assignment: { include: { shift: { include: { location: true } } } },
    },
    orderBy: { date: "desc" },
  });

  if (!attendance) return null;

  let workHours = attendance.shift || attendance.assignment?.shift;

  if (!workHours) return null;

  const shiftEnd = minutesToDateTime(attendance.date, workHours.endTime);
  const isCrossDay = workHours.endTime < workHours.startTime;
  const finalEnd = isCrossDay ? shiftEnd.add(1, "day") : shiftEnd;

  // +2 jam tolerance
  const limit = finalEnd.clone().add(2, "hours");

  const isForgot = now.toDate() > limit.toDate();

  return {
    isForgotCheckout: isForgot,
    attendanceId: attendance.id,
  };
}

export async function userSendEarlyCheckout(reason) {
  const user = await getCurrentUser();
  if (!user?.id) return { error: "Unauthorized" };
  if (!reason?.trim()) return { error: "Reason is required" };

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      checkInTime: { not: null },
      checkOutTime: null,
    },
    orderBy: { date: "desc" },
    include: {
      earlyCheckoutRequests: true,
    }
  });

  if (!attendance) return { error: "You not checkin yet or checkout done already!" };

  const now = getNowJakarta();
  const workMinutes = calculateWorkMinutes(attendance.checkInTime, now.toDate());

  const request = await prisma.earlyCheckoutRequest.create({
    data: {
      userId: user.id,
      attendanceId: attendance.id,
      reason,
      status: "PENDING",
    },
  });

  await pusherServer.trigger(
    "admin-channel",
    "notification-update",
    { message: "early-checkout-created" }
  )

  await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      workMinutes,
      checkOutStatus: "EARLY_CHECKOUT",
      status: "EARLY_CHECKOUT",
      checkOutTime: now.toDate(),
    },
  });

  await safeLog({
    userId: user.id,
    url: "/employee/attendance/main/req?=early-checkout",
    action: LogAction.CREATE,
    method: LogMethod.POST,
    data: {
      attendanceId: attendance.id,
      requestId: request.id,
      reason,
      workMinutes,
    },
  });

  revalidatePath("/employee/dashboard/attendance/main")

  return { success: true };
}

export async function userSendPermissionRequest({ reason, startDate, isLong }) {
  const user = await getCurrentUser()
  if (!user?.id) return { error: "Unauthorized" }
  if (!reason?.trim()) return { error: "Reason is required" }

  try {
    const { today } = await processPermissionRequest(user.id, { reason, startDate, isLong });

    await pusherServer.trigger(
      "admin-channel",
      "notification-update",
      { message: "permission-created" }
    )

    await safeLog({
      userId: user.id,
      url: "/employee/attendance/main/req?=permission",
      action: LogAction.CREATE,
      method: LogMethod.POST,
      data: { reason, date: today, isLong },
    })

    revalidatePath("/employee/dashboard/attendance/main")

    return { success: true }
  } catch (err) {
    return { error: err.message };
  }
}

export async function userSendLeaveRequest({ type, startDate, reason }) {
  const user = await getCurrentUser()
  if (!user?.id) return { error: "Unauthorized" }

  try {
    const request = await processLeaveRequest(user.id, { type, startDate, reason });

    await pusherServer.trigger(
      "admin-channel",
      "notification-update",
      { message: "leave-created" }
    )

    await safeLog({
      userId: user.id,
      url: "/employee/dashboard/main/req?=leave",
      action: LogAction.CREATE,
      method: LogMethod.POST,
      data: {
        leaveRequestId: request.id,
        leaveType: type,
        startDate,
        reason,
      },
    })

    revalidatePath("/employee/dashboard/attendance/main")

    return { success: true }
  } catch (err) {
    return { error: err.message };
  }
}

export async function userManualActivate() {
  const user = await getCurrentUser()
  if (!user?.id) return { error: "Unauthorized" }

  if (user.isActive) {
    return { error: "User is already active" }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      inactiveUntil: null
    }
  })

  revalidatePath("/employee/dashboard/attendance/main")

  return { success: true }
}

