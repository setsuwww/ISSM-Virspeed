"use server";

import prisma from "@/lib/prisma";

export async function getUserScheduleCount(userId) {
  const count = await prisma.scheduleAssignment.count({
    where: { userId },
  });
  return count;
}
