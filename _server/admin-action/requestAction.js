"use server";

import { prisma } from "@/_lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePermissionRequestStatus(id, newStatus, adminReason = null) {
  const permissionId = Number(id);
  if (!Number.isInteger(permissionId)) {
    throw new Error("Invalid permission ID");
  }

  await prisma.attendance.update({
    where: { id: permissionId },
    data: {
      approval: newStatus,
      ...(adminReason ? { adminReason: adminReason } : {}),
    },
  });

  revalidatePath("/admin/dashboard/request");

  return { success: true };
}

export async function updateShiftChangeRequestStatus(id, newStatus, adminReason = null) {
  const scId = Number(id);
  if (!Number.isInteger(scId)) {
    throw new Error("Invalid shift sc ID");
  }

  await prisma.shiftChangeRequest.update({
    where: { id: scId },
    data: {
      status: newStatus,
      ...(adminReason ? { rejectReason: adminReason } : {}),
    },
  });

  revalidatePath("/admin/dashboard/request");

  return { success: true };
}

export async function updateLeaveRequestStatus(id, newStatus, adminReason = null) {
  const leaveId = Number(id);
  if (!Number.isInteger(leaveId)) {
    throw new Error("Invalid leave request ID");
  }

  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: newStatus,
      ...(adminReason ? { adminReason } : {}),
      updatedAt: new Date(),
    },
  });

  revalidatePath("/admin/dashboard/request");
  return { success: true };
}

export async function updateEarlyCheckoutRequestStatus(id, newStatus, adminReason = null) {
  const requestId = Number(id);
  if (!Number.isInteger(requestId)) {
    throw new Error("Invalid early checkout request ID");
  }

  const request = await prisma.earlyCheckoutRequest.findUnique({
    where: { id: requestId },
    select: { attendanceId: true },
  });

  if (!request) {
    throw new Error("Early checkout request not found");
  }

  const now = new Date();

  await prisma.earlyCheckoutRequest.update({
    where: { id: requestId },
    data: {
      status: newStatus,
      ...(adminReason ? { adminReason } : {}),
      reviewedAt: now,
    },
  });

  if (newStatus === "APPROVED" && request.attendanceId) {
    await prisma.attendance.update({
      where: { id: request.attendanceId },
      data: { checkOutTime: now },
    });
  }

  revalidatePath("/admin/dashboard/request");
  return { success: true };
}