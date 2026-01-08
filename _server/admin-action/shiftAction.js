"use server";

import { prisma } from "@/_lib/prisma";
import { revalidatePath } from "next/cache"
import dayjs from "@/_lib/day";

export async function createShift(payload) {
  const { type, name, startTime, endTime, divisionId } = payload

  if (!type || !name || !divisionId) {
    return { error: "Invalid payload" }
  }

  await prisma.shift.create({
    data: {
      type,
      name,
      startTime,
      endTime,
      divisionId,
    },
  })

  revalidatePath("/admin/dashboard/shifts")
  return { success: true }
}

export async function updateShift(id, payload) {
  if (!id) return { error: "Shift ID required" }

  await prisma.shift.update({
    where: { id },
    data: payload,
  })

  revalidatePath("/admin/dashboard/shifts")
  return { success: true }
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
    where: { status: "APPROVED", endDate: { lt: todayStart }},
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