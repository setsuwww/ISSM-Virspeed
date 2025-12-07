"use server"

import { prisma } from "@/_lib/prisma"

export async function updateShiftChangeRequestStatus(requestId, newStatus, reason = null) {
  const cleanId = Number(String(requestId).replace(/^(shift-)/, ""));
  if (isNaN(cleanId)) throw new Error("Invalid ID");

  try {
    const request = await prisma.shiftChangeRequest.findUnique({
      where: { id: cleanId },
      select: {
        id: true, userId: true,
        targetUserId: true,
        oldShiftId: true, targetShiftId: true,
        status: true,
        startDate: true, endDate: true,
      },
    });

    if (!request) throw new Error("Request not found");

    if (newStatus === "APPROVED") {
      const todayStart = dayjs().startOf("day");
      const startDate = request.startDate ? dayjs(request.startDate).startOf("day") : null;

      if (startDate && startDate.isSameOrBefore(todayStart)) {
        if (!request.targetUserId) throw new Error("Target user not found");

        await prisma.$transaction([
          prisma.user.update({
            where: { id: request.userId },
            data: { shiftId: request.targetShiftId },
          }),
          prisma.user.update({
            where: { id: request.targetUserId },
            data: { shiftId: request.oldShiftId },
          }),
        ]);
      }
    }

    const updated = await prisma.shiftChangeRequest.update({
      where: { id: cleanId },
      data: { status: newStatus, ...(reason ? { rejectReason: reason } : {})},
    });

    return { success: true, data: updated };
  } 
  catch (error) { return { success: false, message: error.message }}
}

export async function updatePermissionRequestStatus(requestId, newStatus, reason = null) {
  const cleanId = Number(String(requestId).replace(/^(perm-)/, ""));
  if (isNaN(cleanId)) throw new Error("Invalid permission ID");

  try {
    const attendance = await prisma.attendance.findUnique({ where: { id: cleanId }});

    if (!attendance) throw new Error("Permission request not found");

    const mappedStatus = newStatus.toUpperCase();
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(mappedStatus)) throw new Error(`Invalid approval status: ${newStatus}`);

    const updated = await prisma.attendance.update({
      where: { id: cleanId },
      data: { approval: mappedStatus, ...(reason ? { adminReason: reason } : {})},
    });

    return { success: true, data: updated };
  } 
  catch (error) { return { success: false, message: error.message }}
}
