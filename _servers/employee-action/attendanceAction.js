"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { LogAction, LogMethod } from "@prisma/client"

import {
  getActiveAssignment,
  determineAttendanceStatus,
  evaluateAttendancePolicy,
  canUserCheckout,
  addWorkDays,
  calculateWorkMinutes
} from "@/_functions/helpers/attendanceHelpers"

import { getNowJakarta, getTodayStartJakarta } from "@/_lib/time"
import { safeLog } from "@/_servers/admin-action/logAction"
import { pusherServer } from "@/_lib/pusher"

export async function userPrecheckCheckIn() {
  const user = await getCurrentUser()
  if (!user?.shiftId) return { error: "Unauthorized" }

  const shift = await prisma.shift.findUnique({
    where: { id: user.shiftId },
    include: { location: true },
  })
  if (!shift?.location) return { error: "Shift atau divisi tidak ditemukan" }

  const policy = evaluateAttendancePolicy({ location: shift.location })

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
  if (!user?.id) return { error: "Unauthorized" };

  const now = getNowJakarta();

  const assignment = await getActiveAssignment(user.id);

  // OFF / CUTI Handlers
  if (!assignment || !assignment.shiftId) {
    return { error: "Hari ini OFF / CUTI" };
  }

  const shift = assignment.shift;

  if (!shift?.location) {
    return { error: "Shift atau location tidak ditemukan" };
  }

  // Policy Location & coordinates
  const policy = evaluateAttendancePolicy({
    location: shift.location,
    currentCoords: coords,
  });

  if (!policy.allowed) {
    return { error: policy.message ?? "Check-in tidak diizinkan" };
  }

  // Attendance check
  const existing = await prisma.attendance.findUnique({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: assignment.shiftId,
        date: assignment.date,
      },
    },
  });

  if (existing?.checkInTime) {
    return { error: "Sudah check-in" };
  }

  let status;
  try {
    status = await determineAttendanceStatus(assignment.shiftId, assignment.date);
  } catch (err) {
    return { error: err.message };
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: assignment.shiftId,
        date: assignment.date,
      },
    },
    create: {
      userId: user.id,
      shiftId: assignment.shiftId,
      date: assignment.date,
      status,
      checkInTime: now.toDate(),
      locationType: shift.location.type,
      locationStatus: shift.location.status,
    },
    update: {
      status,
      checkInTime: now.toDate(),
    },
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

  return { success: true };
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
  const assignment = await getActiveAssignment(user.id)

  if (!assignment || !assignment.shiftId) {
    return { error: "Hari ini OFF, tidak perlu izin" }
  }

  await prisma.attendance.upsert({
    where: {
      userId_shiftId_date: {
        userId: user.id,
        shiftId: assignment.shiftId,
        date: assignment.date,
      },
    },
    update: {
      status: "PERMISSION",
      approval: "PENDING",
      reason,
    },
    create: {
      userId: user.id,
      shiftId: assignment.shiftId,
      date: assignment.date,
      status: "PERMISSION",
      approval: "PENDING",
      reason,
    },
  })

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
    data: { reason, date: today },
  })

  return { success: true }
}

export async function userSendLeaveRequest({ type, startDate, endDate, reason }) {
  const user = await getCurrentUser()
  if (!user?.id) return { error: "Unauthorized" }

  const leaveType = await prisma.leaveType.findUnique({
    where: { code: type },
  })
  if (!leaveType) return { error: "Leave type not found" }

  const start = new Date(`${startDate}T12:00:00`)
  const end = endDate ? new Date(`${endDate}T12:00:00`) : new Date(start)
  const year = start.getFullYear()

  // Simplifikasi totalDays untuk purposed hitungan harian.
  const timeDiff = end.getTime() - start.getTime()
  const totalDays = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1)

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
}
