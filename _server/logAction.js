"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"

export async function getUserLogs() {
  const user = await getCurrentUser()
  if (!user?.id) throw new Error("Unauthorized")

  return prisma.activityLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

