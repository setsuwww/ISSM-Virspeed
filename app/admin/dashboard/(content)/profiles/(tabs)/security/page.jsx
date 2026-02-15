import { prisma } from "@/_lib/prisma"
import { SecurityTable } from "./SecurityTable"
import { ContentInformation } from "@/_components/common/ContentInformation"
import ContentForm from "@/_components/common/ContentForm"
import { safeFormat } from "@/_functions/globalFunction"
import SecurityView from "./SecurityView"

export default async function SecurityPage() {
  const logs = await prisma.securityLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      action: true,
      ip: true,
      userAgent: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isLocked: true,
          isFlagged: true,
        },
      },
    },
  })


  const formattedLogs = logs.map(log => {
    return {
      id: log.id,
      action: log.action,
      ip: log.ip,
      userAgent: log.userAgent,
      date: safeFormat(log.createdAt, "dd-MM-yyyy"),
      time: safeFormat(log.createdAt, "HH:mm a"),

      user: log.user
        ? {
          id: log.user.id,
          name: log.user.name,
          email: log.user.email,
          role: log.user.role,
          isLocked: log.user.isLocked,
          isFlagged: log.user.isFlagged
        }
        : null,
    }
  })

  return (
    <SecurityView logs={formattedLogs} />
  )
}
