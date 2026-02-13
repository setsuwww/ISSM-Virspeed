"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { revalidatePath } from "next/cache"

export async function getUserLogs() {
  const user = await getCurrentUser()
  if (!user?.id) throw new Error("Unauthorized")

  return prisma.activityLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function logQuery({ page = 1, limit = 20, userId, action }) {
  const where = {}

  if (userId) where.userId = Number(userId)
  if (action) where.action = action

  return prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })
}

export async function logActivity({ userId, url, action, data, method }) {
  await prisma.activityLog.create({
    data: {
      userId,
      url,
      action,
      method,
      data,
    },
  })
}

export async function clearAllActivityLogs() {
  await prisma.activityLog.deleteMany({})
  revalidatePath("/admin/dashboard/profiles/security")
}

export async function safeLog(payload) {
  try { await logActivity(payload)
    console.log("LOG ACTIVITY:", payload)
  }
  catch (err) { console.error("LOG ACTIVITY FAILED:", err)}
}




