import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import HistoryTable from "./HistoryTable"
import HistoryLayout from "./HistoryLayout"
import { minutesToTime } from "@/_functions/globalFunction"
import { 
  getAttendanceLabel 
} from "@/_functions/helpers/attendanceServerHelpers"

export const revalidate = 60

import { 
  getNowJakarta, 
  getTodayStartJakarta, 
  parseJakarta, 
  formatJakarta 
} from "@/_lib/time"

export default async function Page({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) return notFound()

  const order = searchParams?.order === "asc" ? "asc" : "desc"

  const attendance = await prisma.attendance.findMany({
    where: { userId: user.id },
    orderBy: { date: order },
    include: {
      shift: {
        select: {
          type: true,
          name: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  })

  const todayStart = getTodayStartJakarta()

  const tableData = attendance.map(a => {
    const rawDate = a.date
    const attDate = parseJakarta(rawDate).startOf("day")
    const isToday = attDate.isSame(todayStart, 'day')

    console.log(`[DEBUG-HISTORY] Attendance ID ${a.id}: Raw=${rawDate.toISOString()}, Local=${formatJakarta(rawDate, "YYYY-MM-DD")}, isToday=${isToday}`)

    // Map combined status label
    const combinedStatus = getAttendanceLabel(a.checkInStatus, a.checkOutStatus)

    return {
      id: a.id,
      isToday,

      dateValue: parseJakarta(a.date).valueOf(),

      dateLabel: formatJakarta(a.date, "DD MMMM"),
      dateFull: formatJakarta(a.date, "dddd, DD MMMM YYYY"),

      shiftType: a.shift?.type ?? "OFF",
      shiftName: a.shift?.name ?? "—",
      shiftStartTime: minutesToTime(a.shift?.startTime),
      shiftEndTime: minutesToTime(a.shift?.endTime),

      status: combinedStatus,
      checkInStatus: a.checkInStatus,
      checkOutStatus: a.checkOutStatus,
      approval: a.approval ?? null,

      reason: a.reason ?? "None",
      adminNote: a.adminReason ?? "None",

      checkInTime: a.checkInTime ? formatJakarta(a.checkInTime, "HH:mm") : null,
      checkOutTime: a.checkOutTime ? formatJakarta(a.checkOutTime, "HH:mm") : null,
    }
  })

  return (
    <HistoryLayout>
      <HistoryTable data={tableData} initialOrder={order} />
    </HistoryLayout>
  )
}
