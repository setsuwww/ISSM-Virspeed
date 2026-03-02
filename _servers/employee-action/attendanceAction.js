"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { LogAction, LogMethod } from "@prisma/client"

import {
  determineAttendanceStatus,
  evaluateAttendancePolicy,
  canUserCheckout,
  addWorkDays,
  calculateWorkMinutes
} from "@/_functions/helpers/attendanceHelpers"

import { getNowJakarta, getTodayStartJakarta } from "@/_lib/time"
import { safeLog } from "@/_servers/admin-action/logAction"

export async function userPrecheckCheckIn() {
  const user = await getCurrentUser()
  if (!user?.shiftId) return { error: "Unauthorized" }

  const shift = await prisma.shift.findUnique({
    where: { id: user.shiftId },
    include: { division: true },
  })
  if (!shift?.division) return { error: "Shift atau divisi tidak ditemukan" }

  const policy = evaluateAttendancePolicy({ division: shift.division })

  await safeLog({
    userId: user.id,
    url: "/employee/attendance/main/precheck-location",
    action: LogAction.VIEW,
    method: LogMethod.GET,
    data: {
      requireLocation: policy.ignoreLocation !== true,
      toast: policy.toast,
      timestamp: new Date().toISOString(),
    },
  })

  return {
    requireLocation: policy.ignoreLocation !== true,
    toast: policy.toast,
  }
}

export async function userSendCheckIn(coords = null) {
  const user = await getCurrentUser();

  if (!user?.id || !user.shiftId) {
    return { error: "Unauthorized" };
  }

  const now = getNowJakarta();
  const today = getTodayStartJakarta().toDate();

  const shift = await prisma.shift.findUnique({
    where: { id: user.shiftId },
    include: { division: true },
  });

  if (!shift?.division) {
    return { error: "Shift atau divisi tidak ditemukan" };
  }

  const policy = evaluateAttendancePolicy({
    division: shift.division,
    currentCoords: coords,
  });

  if (!policy.allowed) {
    return { error: policy.message ?? "Check-in tidak diizinkan" };
  }

  const existing = await prisma.attendance.findUnique({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId,
        date: today,
      },
    },
  });

  if (existing?.checkInTime) {
    return { error: "Anda sudah check-in hari ini" };
  }

  let status;
  try { status = await determineAttendanceStatus(user.shiftId)}
  catch (err) { return { error: err.message } }

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
  });

  // Log action
  await safeLog({
    userId: user.id,
    url: "/employee/attendance/main/check-in",
    action: LogAction.SUBMIT,
    method: LogMethod.POST,
    data: { attendanceId: attendance.id, status, coords },
  });

  return { success: true, attendance };
}

export async function userSendCheckOut() {
  const user = await getCurrentUser();
  if (!user?.shiftId) return { error: "User tidak memiliki shift aktif" };

  const allowed = await canUserCheckout(user.shiftId);
  if (!allowed) return { error: "Belum waktunya checkout" };

  const now = getNowJakarta();
  const today = getTodayStartJakarta().toDate();

  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId,
        date: today,
      },
    },
  });

  if (!attendance?.checkInTime)
    return { error: "You not checkin yet!" };

  if (attendance.checkOutTime)
    return { error: "You checkout done already!" };

  const checkoutTime = now.toDate();

  const workMinutes = calculateWorkMinutes(
    attendance.checkInTime,
    checkoutTime
  );

  if (workMinutes == null)
    return { error: "Checkout unvalid" };

  await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOutTime: checkoutTime,
      workMinutes,
    },
  });

  await safeLog({
    userId: user.id,
    url: "/employee/attendance/main/check-out",
    action: LogAction.SUBMIT,
    method: LogMethod.POST,
    data: {
      checkoutTime,
      workMinutes,
    },
  });

  return { success: true };
}

export async function userSendEarlyCheckout(reason) {
  const user = await getCurrentUser();
  if (!user?.shiftId) return { error: "Unauthorized" };
  if (!reason?.trim()) return { error: "Reason is required" };

  const today = getTodayStartJakarta().toDate();
  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: user.shiftId,
        date: today,
      },
    },
  });

  if (!attendance?.checkInTime)
    return { error: "You not checkin yet!" };
  if (attendance.checkOutTime)
    return { error: "You checkout done already!" };

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

  await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      workMinutes,
      earlyCheckoutReason: reason,
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

  return { success: true };
}

export async function userSendPermissionRequest(reason) {
  const user = await getCurrentUser()
  if (!user?.id) return { error: "Unauthorized" }
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

  await safeLog({
    userId: user.id,
    url: "/employee/attendance/main/req?=permission",
    action: LogAction.CREATE,
    method: LogMethod.POST,
    data: { reason, date: today },
  })

  return { success: true }
}

export async function userSendLeaveRequest({ type, startDate, reason }) {
  const user = await getCurrentUser()
  if (!user?.id) return { error: "Unauthorized" }

  const leaveType = await prisma.leaveType.findUnique({
    where: { code: type },
  })
  if (!leaveType) return { error: "Leave type not found" }

  const start = new Date(`${startDate}T12:00:00`)
  const year = start.getFullYear()

  const totalDays = leaveType.category === "ANNUAL" ? leaveType.maxDays : 1
  const end =
    leaveType.category === "ANNUAL"
      ? addWorkDays(start, totalDays - 1)
      : new Date(start)

  const conflict = await prisma.leaveRequest.findFirst({
    where: {
      userId: user.id,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: end },
      endDate: { gte: start },
    },
  })
  if (conflict) return { error: "Leave date overlaps" }

  const balance =
    (await prisma.userLeaveBalance.findUnique({
      where: {
        userId_leaveTypeId_year: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          year,
        },
      },
    })) ??
    (await prisma.userLeaveBalance.create({
      data: {
        userId: user.id,
        leaveTypeId: leaveType.id,
        year,
        totalDays: leaveType.maxDays,
        usedDays: 0,
      },
    }))

  if (balance.totalDays - balance.usedDays < totalDays) {
    return { error: "Leave balance not sufficient" }
  }

  const request = await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      leaveTypeId: leaveType.id,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason?.trim() || null,
    },
  })

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
}
