"use server";

import { prisma } from "@/_lib/prisma";
import { revalidatePath } from "next/cache";
import { validateCreateShift, validateUpdateShift } from "@/_jobs/validator/shift_validate";

export async function getShifts(page, limit) {
  return prisma.shift.findMany({
    where: { type: { in: ["MORNING", "AFTERNOON", "EVENING"] } },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { type: "asc" },
    select: {
      id: true,
      type: true,
      name: true,
      startTime: true,
      endTime: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          attendances: {
            select: { shiftId: true, status: true, reason: true },
          },
        },
      },
      location: { select: { name: true } },
    },
  });
}

export async function getShiftCount() {
  return prisma.shift.count({
    where: { type: { in: ["MORNING", "AFTERNOON", "EVENING"] } },
  });
}

export async function createShift(payload) {
  const result = await validateCreateShift(payload);

  if (!result.success) {
    return { error: Object.values(result.errors).flat().join(", ") };
  }

  const { type, name, startTime, endTime, locationId } = result.data;

  await prisma.shift.create({
    data: { type, name, startTime, endTime, locationId },
  });

  revalidatePath("/admin/dashboard/shifts");
  return { success: true };
}

export async function updateShift(id, payload) {
  if (!id) return { error: "Shift ID required" };

  const result = await validateUpdateShift({ id, ...payload });

  if (!result.success) {
    return { error: Object.values(result.errors).flat().join(", ") };
  }

  const updateData = { ...result.data };
  delete updateData.id;
 
  // [STRICT LOCATION RULE]
  // If locationId is being updated, check for active assignments
  if (updateData.locationId) {
    const currentShift = await prisma.shift.findUnique({
      where: { id },
      select: { locationId: true }
    })

    if (currentShift && currentShift.locationId !== updateData.locationId) {
      const futureAssignmentsCount = await prisma.shiftAssignment.count({
        where: {
          shiftId: id,
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      })

      if (futureAssignmentsCount > 0) {
        return { error: "Shift tidak bisa pindah lokasi karena masih memiliki penugasan aktif di masa depan." }
      }
    }
  }

  await prisma.shift.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/dashboard/shifts");
  return { success: true };
}

export async function deleteShiftById(id) {
  if (!id) return { error: "Shift ID required" };

  await prisma.shift.delete({
    where: { id },
  });

  revalidatePath("/admin/dashboard/shifts");
  return { success: true };
}

export async function deleteShifts(ids) {
  if (!ids || ids.length === 0) {
    return { error: "No IDs provided" };
  }

  await prisma.shift.deleteMany({
    where: {
      id: { in: ids },
    },
  });

  revalidatePath("/admin/dashboard/shifts");
  return { success: true };
}

export async function updateShiftChangeStatus(id, action, actorRole) {
  const request = await prisma.shiftChangeRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Request not found");

  let newStatus = request.status;

  if (actorRole === "TARGET") {
    if (action === "ACCEPT") newStatus = "PENDING_ADMIN";
    if (action === "REJECT") newStatus = "REJECTED";
  }

  if (actorRole === "ADMIN") {
    if (action === "APPROVE") newStatus = "APPROVED";
    if (action === "REJECT") newStatus = "REJECTED";
  }

  const updated = await prisma.shiftChangeRequest.update({
    where: { id },
    data: { status: newStatus },
  });

  return { success: true, data: updated };
}

export async function resetExpiredShiftChanges(todayOverride = null) {
  const todayStart = (todayOverride || dayjs()).startOf("day").toDate();

  const expiredRequests = await prisma.shiftChangeRequest.findMany({
    where: { status: "APPROVED", endDate: { lt: todayStart } },
    select: {
      id: true, userId: true,
      targetUserId: true, oldShiftId: true, targetShiftId: true,
    },
  });

  let reverted = 0;

  for (const req of expiredRequests) {
    const [user, targetUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.userId }, select: { shiftId: true } }),
      prisma.user.findUnique({ where: { id: req.targetUserId }, select: { shiftId: true } }),
    ]);

    if (user?.shiftId !== req.targetShiftId && targetUser?.shiftId !== req.oldShiftId) { continue }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: req.userId },
        data: { shiftId: req.oldShiftId },
      }),
      prisma.user.update({
        where: { id: req.targetUserId },
        data: { shiftId: req.targetShiftId },
      }),
      prisma.shiftChangeRequest.update({
        where: { id: req.id },
        data: { status: "PENDING" },
      }),
    ]);
    reverted++;
  }

  return { success: true, count: reverted };
}

export async function startingShiftUpdate(todayOverride = null) {
  const todayStart = (todayOverride || dayjs()).startOf("day");
  const today = todayStart.toDate();

  const readyRequests = await prisma.shiftChangeRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: today },
      OR: [{ endDate: { gte: today } }, { endDate: null }],
    },
    select: {
      id: true, userId: true, targetUserId: true,
      oldShiftId: true, targetShiftId: true,
      startDate: true, endDate: true,
    },
  });

  let applied = 0;

  for (const req of readyRequests) {
    if (!req.targetUserId) continue;

    const now = todayStart;
    const isStartDay = now.isSame(dayjs(req.startDate), "day");
    const isEndDay = req.endDate ? now.isSame(dayjs(req.endDate), "day") : false;

    const [user, targetUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.userId }, select: { shiftId: true } }),
      prisma.user.findUnique({ where: { id: req.targetUserId }, select: { shiftId: true } }),
    ]);

    if (isStartDay && user?.shiftId !== req.targetShiftId && targetUser?.shiftId !== req.oldShiftId) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.userId },
          data: { shiftId: req.targetShiftId },
        }),
        prisma.user.update({
          where: { id: req.targetUserId },
          data: { shiftId: req.oldShiftId },
        }),
      ]);
      applied++;
    }

    if (isEndDay && user?.shiftId !== req.oldShiftId && targetUser?.shiftId !== req.targetShiftId) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.userId },
          data: { shiftId: req.oldShiftId },
        }),
        prisma.user.update({
          where: { id: req.targetUserId },
          data: { shiftId: req.targetShiftId },
        }),
        prisma.shiftChangeRequest.update({
          where: { id: req.id },
          data: { status: null },
        }),
      ]);
      applied++;
    }
  }

  return { success: true, count: applied, processed: readyRequests.length };
}
