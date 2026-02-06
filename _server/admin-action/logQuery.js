import { prisma } from "@/_lib/prisma"

export async function logQuery({
  page = 1,
  limit = 20,
  userId,
  action,
}) {
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
