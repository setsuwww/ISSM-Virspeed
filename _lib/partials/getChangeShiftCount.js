import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "../auth"

export async function getChangeShiftCount() {
  const user = await getCurrentUser()
  if (!user) return 0

  return prisma.shiftChangeRequest.count({
    where: {
      targetUserId: user.id,
      status: "PENDING_TARGET",
      verifiedByTarget: false,
    },
  })
}
