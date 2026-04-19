import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "../../_lib/auth"

export async function getScheduleCount() {
  const user = await getCurrentUser()
  if (!user) return 0

  const count = await prisma.schedulesOnUsers.count({
    where: { userId: user.id }
  })

  return count
}
