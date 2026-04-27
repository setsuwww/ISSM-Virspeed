"use server";

import { prisma } from "@/_lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateWorkMinutes } from "@/_functions/helpers/attendanceServerHelpers"

export async function updatePermissionRequestStatus(id, newStatus, adminReason = null) {
  const permId = Number(id);
  if (!Number.isInteger(permId)) {
    throw new Error("Invalid permission ID");
  }

  const attendance = await prisma.attendance.update({
    where: { id: permId },
    data: { approval: newStatus, ...(adminReason ? { adminReason: adminReason } : {}) },
  });

  if (newStatus === "APPROVED") {
    await prisma.user.update({
      where: { id: attendance.userId },
      data: { isActive: false },
    });
  }

  revalidatePath("/admin/dashboard/requests");
  revalidatePath("/api/system-config/admin-notification");

  return { success: true };
}

export async function updateShiftChangeRequestStatus(id, newStatus, adminReason = null) {
  const shchId = Number(id);
  if (!Number.isInteger(shchId)) {
    throw new Error("Invalid shift sc ID");
  }

  await prisma.shiftChangeRequest.update({
    where: { id: shchId },
    data: { status: newStatus, ...(adminReason ? { rejectReason: adminReason } : {}) },
  });

  revalidatePath("/admin/dashboard/requests");
  revalidatePath("/api/system-config/admin-notification");

  return { success: true };
}

export async function updateLeaveRequestStatus(id, newStatus, adminReason = null) {
  const leaveId = Number(id);
  if (!Number.isInteger(leaveId)) {
    throw new Error("Invalid leave request ID");
  }

  const req = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: newStatus, ...(adminReason ? { adminReason } : {}), updatedAt: new Date() },
  });

  if (newStatus === "APPROVED") {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { shiftId: true }
    });

    if (user?.shiftId) {
      const current = new Date(req.startDate);
      while (current <= req.endDate) {
        await prisma.attendance.upsert({
          where: {
            userId_shiftId_date: {
              userId: req.userId,
              shiftId: user.shiftId,
              date: current
            }
          },
          update: {
            status: "INACTIVE",
            reason: req.reason || "Approved Leave"
          },
          create: {
            userId: req.userId,
            shiftId: user.shiftId,
            date: current,
            status: "INACTIVE",
            reason: req.reason || "Approved Leave"
          }
        });
        current.setDate(current.getDate() + 1);
      }
      await prisma.user.update({
        where: { id: req.userId },
        data: { isActive: false },
      });
    }

    revalidatePath("/admin/dashboard/requests");
    revalidatePath("/api/system-config/admin-notification");

    return { success: true };
  }
}

export async function updateEarlyCheckoutRequestStatus(id, newStatus, adminReason = null) {
  const requestId = Number(id);
  if (!Number.isInteger(requestId)) {
    throw new Error("Invalid early checkout request ID");
  }

  const request = await prisma.earlyCheckoutRequest.findUnique({
    where: { id: requestId },
    include: { attendance: true },
  });

  if (!request) {
    throw new Error("Early checkout request not found");
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.earlyCheckoutRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        ...(adminReason ? { adminReason } : {}),
        reviewedAt: now,
      },
    });

    if (newStatus === "APPROVED") {
      if (!request.attendance?.checkInTime) {
        throw new Error("Check-in time not found");
      }

      const workMinutes = calculateWorkMinutes(
        request.attendance.checkInTime,
        now
      );

      if (workMinutes == null) {
        throw new Error("Invalid work duration");
      }

      await tx.attendance.update({
        where: { id: request.attendanceId },
        data: {
          checkOutTime: now,
          workMinutes,
        },
      });
    }
  });

  revalidatePath("/admin/dashboard/requests");
  revalidatePath("/api/system-config/admin-notification");

  return { success: true };
}

export async function clearHistory(type) {
  switch (type) {
    case "changeshift":
      await prisma.shiftChangeRequest.deleteMany({
        where: { status: { in: ["APPROVED", "REJECTED"] } },
      })
      break
    case "leave":
      await prisma.leaveRequest.deleteMany({
        where: { status: { in: ["APPROVED", "REJECTED"] } },
      })
      break
    case "early":
      await prisma.earlyCheckoutRequest.deleteMany({
        where: { status: { in: ["APPROVED", "REJECTED"] } },
      })
      break
    case "permission":
      await prisma.attendance.deleteMany({
        where: {
          status: "PERMISSION",
          approval: { in: ["APPROVED", "REJECTED"] },
        },
      });
      break
    default:
      throw new Error("Invalid request type")
  }

  return { success: true, message: "History cleared successfully" }
}

export async function getPendingRequestsSummary() {
  const [leave, earlyCheckout, shiftChange, permissionAttendance] = await Promise.all([
    prisma.leaveRequest.count({
      where: { status: "PENDING" },
    }),

    prisma.earlyCheckoutRequest.count({
      where: { status: "PENDING" },
    }),

    prisma.shiftChangeRequest.count({
      where: {
        OR: [
          { status: "PENDING_TARGET" },
          { status: "PENDING_ADMIN" },
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        status: "PERMISSION",
        OR: [
          { approval: "PENDING" },
          { approval: null },
        ],
      },
    })
  ])

  return {
    total: leave + earlyCheckout + shiftChange + permissionAttendance,
    breakdown: { leave, earlyCheckout, shiftChange, permission: permissionAttendance },
  }
}
