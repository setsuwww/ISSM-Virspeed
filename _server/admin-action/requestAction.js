"use server";

import { prisma } from "@/_lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePermissionRequestStatus(id, newStatus, reason = null) {
  const permissionId = Number(id);
  if (!Number.isInteger(permissionId)) {
    throw new Error("Invalid permission ID");
  }

  await prisma.attendance.update({
    where: { id: permissionId },
    data: {
      approval: newStatus,
      ...(reason ? { adminReason: reason } : {}),
    },
  });

  revalidatePath("/admin/dashboard/request");

  return { success: true };
}

export async function updateShiftChangeRequestStatus(id, newStatus, reason = null) {
  const scId = Number(id);
  if (!Number.isInteger(scId)) {
    throw new Error("Invalid shift sc ID");
  }

  await prisma.shiftChangeRequest.update({
    where: { id: scId },
    data: {
      status: newStatus,
      ...(reason ? { rejectReason: reason } : {}),
    },
  });

  revalidatePath("/admin/dashboard/request");

  return { success: true };
}
