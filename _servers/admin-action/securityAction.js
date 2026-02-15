"use server"

import { prisma } from "@/_lib/prisma"
import { SecurityAction } from "@prisma/client"
import { revalidatePath } from "next/cache"

const MAX_SCORE = 100
const WINDOW_MINUTES = 15


export async function blockUser(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isLocked: true,
    }
  })

  await prisma.securityLog.create({
    data: {
      userId,
      action: SecurityAction.ACCOUNT_LOCKED,
    },
  })
}

export async function unblockUser(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isLocked: false,
    },
  })

  await prisma.securityLog.create({
    data: {
      userId,
      action: SecurityAction.ACCOUNT_UNLOCKED,
    },
  })
}

export async function markSuspicious(log) {
  if (log.userId) {
    await prisma.user.update({
      where: { id: log.userId },
      data: { isFlagged: true },
    })
  }

  await prisma.suspiciousActivity.create({
    data: {
      userId: log.userId,
      ip: log.ip,
      reason: `Flagged from security log: ${log.action}`,
      score: 50,
    },
  })
}

export async function unmarkSuspicious(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isFlagged: false,
    },
  })
}

export async function logSecurity({
  userId,
  action,
  ip,
  userAgent,
}) {
  await prisma.securityLog.create({
    data: {
      userId,
      action,
      ip,
      userAgent,
    },
  })
}

export async function reportSuspicious({
  userId,
  ip,
  reason,
  score,
}) {
  await prisma.suspiciousActivity.create({
    data: {
      userId,
      ip,
      reason,
      score,
    },
  })
}

export async function checkAndLockUser(userId) {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)

  const activities = await prisma.suspiciousActivity.findMany({
    where: {
      userId,
      createdAt: { gte: since },
      resolved: false,
    },
  })

  const totalScore = activities.reduce((sum, a) => sum + a.score, 0)

  if (totalScore >= MAX_SCORE) {
    await prisma.user.update({
      where: { id: userId },
      data: { isLocked: true },
    })

    await prisma.securityLog.create({
      data: {
        userId,
        action: SecurityAction.ACCOUNT_LOCKED,
      },
    })
  }
}

export async function clearUserSession(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      tokenVersion: { increment: 1 },
    },
  })

  await prisma.securityLog.create({
    data: {
      userId,
      action: "SESSION_CLEARED",
    },
  })
}

export async function clearAllSecurityLogs() {
  await prisma.securityLog.deleteMany({})
  revalidatePath("/admin/dashboard/profiles/security")
}



