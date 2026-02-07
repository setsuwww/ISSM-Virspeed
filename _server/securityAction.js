"use server"

import { prisma } from "@/_lib/prisma"

const MAX_SCORE = 100
const WINDOW_MINUTES = 15

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


