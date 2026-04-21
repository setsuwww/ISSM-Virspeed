"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { LogAction, LogMethod } from "@prisma/client"

import {
  evaluateAttendancePolicy,
  processPermissionRequest,
  processLeaveRequest,
  getActiveAssignment,
  getCheckoutWarning,
  determineAttendanceStatus,
  isForgotCheckoutEligible,
} from "@/_functions/helpers/attendanceServerHelpers"

import { getNowJakarta, getTodayStartJakarta, minutesToDateTime } from "@/_lib/time"
import { safeLog } from "@/_servers/admin-services/log_action"
import { pusherServer } from "@/_lib/pusher"

import { calculateWorkMinutes } from "@/_functions/helpers/calculateShift"

export async function userPrecheckCheckIn() {
  const user = await getCurrentUser()
  if (!user?.id) return { error: "Unauthorized" }

  const now = getNowJakarta()
  const assignment = await getActiveAssignment(user.id)

  let shift = assignment?.shift;
  let workHours = null;
  let location = null;
  let date = assignment?.date || getTodayStartJakarta().toDate();

  if (shift) {
    workHours = shift;
    location = shift.location;
  } else {
    // Fallback to User -> Location pattern (Normal User)
    const userWithLocation = await prisma.user.findUnique({
      where: { id: user.id },
      include: { location: true }
    });
    if (userWithLocation?.location?.startTime != null && userWithLocation?.location?.endTime != null) {
      workHours = userWithLocation.location;
      location = userWithLocation.location;
    }
  }

  if (!workHours) {
    return {
      requireLocation: false,
      checkIn: { disabled: true, reason: "Hari ini OFF / Tidak ada jadwal" },
      checkOut: { disabled: true, reason: "Hari ini OFF / Tidak ada jadwal" },
    }
  }

  const shiftStart = minutesToDateTime(date, workHours.startTime)
  const shiftEnd = minutesToDateTime(date, workHours.endTime)
  const isCrossDay = workHours.endTime < workHours.startTime
  const finalEnd = isCrossDay ? shiftEnd.add(1, "day") : shiftEnd

  // Check Attendance
  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      date: date,
      // If we use multiple shifts per day, we'd need more logic,
      // but for Normal vs Shift, this protects duplicates.
    },
    include: { earlyCheckoutRequests: true }
  })

  // Check Requests (Leave/Permission)
  const hasRequest = attendance?.status === "PERMISSION" || attendance?.status === "INACTIVE"

  const diffStartMin = shiftStart.diff(now) / (60 * 1000)
  const isShiftEnded = now.isAfter(finalEnd)
  const isCheckInOpen = diffStartMin <= 20
  const isShiny = diffStartMin <= 10 && diffStartMin > 0

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

  const policy = await evaluateAttendancePolicy({ location })

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
  const assignment = await getActiveAssignment(user.id);

  let shift = assignment?.shift;
  let workHours = null;
  let date = assignment?.date || getTodayStartJakarta().toDate();

  if (shift) {
    workHours = shift;
  } else {
    const userWithLocation = await prisma.user.findUnique({
      where: { id: user.id },
      include: { location: true }
    });
    if (userWithLocation?.location?.startTime != null && userWithLocation?.location?.endTime != null) {
      workHours = userWithLocation.location;
    }
  }

  if (!workHours) {
    return { error: "Hari ini OFF / Tidak ada jadwal" };
  }

  // Policy Location & coordinates
  const policy = await evaluateAttendancePolicy({
    location: workHours,
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
      // Protect duplicate checkin for same day
    },
  });

  if (existing?.checkInTime) {
    return { error: "Sudah check-in" };
  }

  let status;
  try {
    status = await determineAttendanceStatus({
      shiftId: shift?.id,
      locationId: workHours.id,
      assignmentDate: date
    });
  } catch (err) {
    return { error: err.message };
  }

  const attendance = await prisma.attendance.create({
    data: {
      userId: user.id,
      shiftId: shift?.id,
      date: date,
      status,
      checkInTime: now.toDate(),
      locationType: workHours.type,
      locationStatus: workHours.status,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: true }
  });

  await safeLog({
    userId: user.id,
    url: "/employee/attendance/check-in",
    action: LogAction.SUBMIT,
    method: LogMethod.POST,
    data: { attendanceId: attendance.id, status },
  });

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
    orderBy: { date: "desc" },
  });

  if (!attendance) {
    return { error: "Belum check-in atau sudah checkout" };
  }

  const checkoutTime = now.toDate();

  const userWithHours = await prisma.user.findUnique({
    where: { id: user.id },
    include: { shift: true, location: true },
  });

  let workHours = userWithHours?.shift || (userWithHours?.location?.startTime != null ? userWithHours.location : null);

  if (!workHours) {
    return { error: "Jadwal kerja tidak ditemukan" };
  }

  const shiftEnd = minutesToDateTime(attendance.date, workHours.endTime);
  const isCrossDay = workHours.endTime < workHours.startTime;
  const finalEnd = isCrossDay ? shiftEnd.add(1, "day") : shiftEnd;

  const warning = getCheckoutWarning(finalEnd, now);

  const workMinutes = calculateWorkMinutes(
    attendance.checkInTime,
    checkoutTime
  );

  if (workMinutes == null) {
    return { error: "Invalid checkout" };
  }

  await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOutTime: checkoutTime,
      workMinutes,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: false }
  });

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
      shift: true,
    },
    orderBy: { date: "desc" },
  });

  if (!attendance) return null;

  let workHours = attendance.shift;
  if (!workHours) {
    const userWithLoc = await prisma.user.findUnique({
      where: { id: user.id },
      include: { location: true }
    });
    if (userWithLoc?.location?.startTime != null && userWithLoc?.location?.endTime != null) {
      workHours = userWithLoc.location;
    }
  }

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
  if (!user?.shiftId) return { error: "Unauthorized" };
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
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: false }
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

    return { success: true }
  } catch (err) {
    return { error: err.message };
  }
}
