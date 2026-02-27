"use server";

import { prisma } from "@/_lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateWorkMinutes } from "@/_functions/helpers/attendanceHelpers"

export async function updatePermissionRequestStatus(id, newStatus, adminReason = null) {
  const permId = Number(id);
  if (!Number.isInteger(permId)) {
    throw new Error("Invalid permission ID");
  }

  await prisma.attendance.update({
    where: { id: permId },
    data: { approval: newStatus, ...(adminReason ? { adminReason: adminReason } : {})},
  });

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
    data: { status: newStatus, ...(adminReason ? { rejectReason: adminReason } : {})},
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

  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {  status: newStatus,  ...(adminReason ? { adminReason } : {}), updatedAt: new Date()},
  });

  revalidatePath("/admin/dashboard/requests");
  revalidatePath("/api/system-config/admin-notification");

  return { success: true };
}

export async function updateEarlyCheckoutRequestStatus( id, newStatus, adminReason = null) {
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
          earlyCheckoutReason: request.reason,
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
    case "shift":
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
      await prisma.permissionRequest?.deleteMany({
        where: { status: { in: ["APPROVED", "REJECTED"] } },
      })
      break
    default:
      throw new Error("Invalid request type")
  }

  return { success: true, message: "History cleared successfully" }
}
