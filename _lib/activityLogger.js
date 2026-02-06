// @/_lib/activityLogger.ts
import { prisma } from "@/_lib/prisma"

export async function logActivity({
  userId,
  url,
  action,
  data,
  method = "POST",
}) {
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
