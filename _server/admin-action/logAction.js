"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { revalidatePath } from "next/cache"
import { safeFormat } from "@/_function/globalFunction"

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

  if (userId) where.userId = userId
  if (action) where.action = action

  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      url: true,
      action: true,
      method: true,
      data: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
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

  return logs.map((log) => ({
    id: log.id,
    url: log.url,
    action: log.action,
    method: log.method,
    data: log.data ?? {},
    ip: log.ipAddress ?? "",
    userAgent: log.userAgent ?? "",
    createdAt: safeFormat(log.createdAt, "dd-MMMM-yyyy, HH:ii"),
    user: {
      id: log.user.id,
      name: log.user.name,
      email: log.user.email,
      role: log.user.role,
    },
  }))
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




