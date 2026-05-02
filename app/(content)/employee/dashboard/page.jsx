import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/_lib/auth'
import { prisma } from '@/_lib/prisma'

import Calendar from './Calendar'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { formatTime } from '@/_functions/globalFunction'
import { getShiftStyle } from '@/_components/_constants/shiftConstants'

import { 
  getNowJakarta, 
  getTodayStartJakarta, 
  parseJakarta, 
  formatJakarta 
} from '@/_lib/time'

export default async function EmployeeDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')

  const nowJakarta = getNowJakarta()
  const start = nowJakarta.clone().subtract(1, "month").startOf("month").toDate()
  const end = nowJakarta.clone().add(1, "month").endOf("month").toDate()

  console.log(`[DEBUG-EMPLOYEE] DB Fetch Range: ${start.toISOString()} to ${end.toISOString()}`)

  const [
    assignments,
    attendanceHistory,
    earlyCheckouts,
    permissions,
    leaves,
    shiftChanges,
    securityLogs
  ] = await Promise.all([
    prisma.shiftAssignment.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        shift: true
      },
    }),

    // 2. Attendance History (Last 15 records, ignoring PERMISSION)
    prisma.attendance.findMany({
      where: {
        userId: user.id,
        status: { not: "PERMISSION" }
      },
      take: 15
    }),

    // 3. Early Checkout Requests (Last 10)
    prisma.earlyCheckoutRequest.findMany({
      where: { userId: user.id },
      include: { attendance: true },
      take: 10
    }),

    // 4. Permission Requests (Stored in Attendance as PERMISSION)
    prisma.attendance.findMany({
      where: {
        userId: user.id,
        status: "PERMISSION"
      },
      take: 10
    }),

    // 5. Leave Requests
    prisma.leaveRequest.findMany({
      where: { userId: user.id },
      include: { leaveType: true },
      take: 10
    }),

    // 6. Shift Change Requests
    prisma.shiftChangeRequest.findMany({
      where: { requestedById: user.id },
      include: {
        oldShift: true,
        targetShift: true
      },
      take: 10
    }),

    // 7. Security Logs (Login successes today)
    prisma.securityLog.findMany({
      where: {
        userId: user.id,
        action: {
          in: ["LOGIN_SUCCESS", "LOGOUT"]
        },
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  ])

  const todayStr = nowJakarta.format("YYYY-MM-DD")

  // 1. Calendar Map (O(1) lookup)
  const calendarMap = assignments.reduce((acc, assignment) => {
    // RAW date from DB
    const rawDate = assignment.date
    const dateStr = formatJakarta(rawDate, "YYYY-MM-DD")
    
    console.log(`[DEBUG-EMPLOYEE] Assignment: Raw=${rawDate.toISOString()}, Local=${dateStr}`)

    acc[dateStr] = {
      ...assignment,
      shiftStyle: getShiftStyle(assignment.shift?.type),
      startTimeStr: formatTime(assignment.shift?.startTime),
      endTimeStr: formatTime(assignment.shift?.endTime),
    }
    return acc
  }, {})

  // 2. Today's Activity (Simplified & Sorted)
  const todayActivity = [
    // Security Logs (Login/Logout)
    ...securityLogs.map(log => ({
      time: formatJakarta(log.createdAt, "HH:mm"),
      rawTime: parseJakarta(log.createdAt).toDate(),
      type: log.action === "LOGOUT" ? "LOGOUT" : "LOGIN",
      label: log.action === "LOGOUT" ? "Logout" : "Login"
    })),
    // Attendance (Today)
    ...attendanceHistory
      .filter(att => formatJakarta(att.date, "YYYY-MM-DD") === todayStr)
      .flatMap(att => {
        const events = []
        if (att.checkInTime) events.push({
          time: formatJakarta(att.checkInTime, "HH:mm"),
          rawTime: parseJakarta(att.checkInTime).toDate(),
          type: "CHECK_IN",
          label: "Check-in"
        })
        if (att.checkOutTime) events.push({
          time: formatJakarta(att.checkOutTime, "HH:mm"),
          rawTime: parseJakarta(att.checkOutTime).toDate(),
          type: "CHECK_OUT",
          label: "Check-out"
        })
        return events
      }),
    // Early Checkout Requests (Today)
    ...earlyCheckouts
      .filter(req => formatJakarta(req.requestedAt, "YYYY-MM-DD") === todayStr)
      .map(req => ({
        time: formatJakarta(req.requestedAt, "HH:mm"),
        rawTime: parseJakarta(req.requestedAt).toDate(),
        type: "EARLY_CHECKOUT_REQUEST",
        label: "Early Checkout Request"
      })),
    // Permission Requests (Today)
    ...permissions
      .filter(req => formatJakarta(req.date, "YYYY-MM-DD") === todayStr)
      .map(req => ({
        time: req.checkInTime ? formatJakarta(req.checkInTime, "HH:mm") : "00:00",
        rawTime: req.checkInTime ? parseJakarta(req.checkInTime).toDate() : parseJakarta(req.date).toDate(),
        type: "PERMISSION_REQUEST",
        label: "Permission Request"
      })),
    // Leaves (Ongoing Today)
    ...leaves
      .filter(req => {
        const start = formatJakarta(req.startDate, "YYYY-MM-DD")
        const end = formatJakarta(req.endDate, "YYYY-MM-DD")
        return todayStr >= start && todayStr <= end
      })
      .map(req => ({
        time: "All Day",
        rawTime: parseJakarta(req.startDate).toDate(),
        type: "LEAVE_REQUEST",
        label: `Leave: ${req.leaveType?.name || "Request"}`
      })),
    // Shift Changes (Ongoing Today)
    ...shiftChanges
      .filter(req => {
        const start = formatJakarta(req.startDate, "YYYY-MM-DD")
        const end = req.endDate ? formatJakarta(req.endDate, "YYYY-MM-DD") : todayStr
        return todayStr >= start && todayStr <= end
      })
      .map(req => ({
        time: "All Day",
        rawTime: parseJakarta(req.startDate).toDate(),
        type: "SHIFT_CHANGE_REQUEST",
        label: "Shift Change Request"
      }))
  ].sort((a, b) => {
    if (a.time === "All Day") return -1
    if (b.time === "All Day") return 1
    return a.rawTime - b.rawTime
  }).map(({ rawTime, ...rest }) => rest)

  // 3. History Data (Grouped & Filtered)
  const historyData = {
    attendance: attendanceHistory
      .filter(att => formatJakarta(att.date, "YYYY-MM-DD") < todayStr)
      .map(att => ({
        id: att.id,
        dateStr: formatJakarta(att.date, "DD MMM YYYY"),
        checkInStr: att.checkInTime ? formatJakarta(att.checkInTime, "HH:mm") : "-",
        checkOutStr: att.checkOutTime ? formatJakarta(att.checkOutTime, "HH:mm") : "-",
        status: att.status || "-"
      })),
    earlyCheckouts: earlyCheckouts
      .filter(req => formatJakarta(req.requestedAt, "YYYY-MM-DD") < todayStr)
      .map(req => ({
        id: req.id,
        dateStr: req.attendance?.date ? formatJakarta(req.attendance.date, "DD MMM YYYY") : "-",
        status: req.status,
        reason: req.reason ? (req.reason.length > 50 ? req.reason.substring(0, 50) + "..." : req.reason) : "-"
      })),
    permissions: permissions
      .filter(req => formatJakarta(req.date, "YYYY-MM-DD") < todayStr)
      .map(req => ({
        id: req.id,
        dateStr: formatJakarta(req.date, "DD MMM YYYY"),
        status: req.approval || "PENDING",
        reason: req.reason ? (req.reason.length > 50 ? req.reason.substring(0, 50) + "..." : req.reason) : "-"
      })),
    leaves: leaves
      .filter(req => formatJakarta(req.endDate, "YYYY-MM-DD") < todayStr)
      .map(req => ({
        id: req.id,
        type: req.leaveType?.name || "-",
        status: req.status,
        range: `${formatJakarta(req.startDate, "DD MMM")} - ${formatJakarta(req.endDate, "DD MMM YYYY")}`
      })),
    shiftChanges: shiftChanges
      .filter(req => formatJakarta(req.startDate, "YYYY-MM-DD") < todayStr)
      .map(req => ({
        id: req.id,
        dateStr: formatJakarta(req.startDate, "DD MMM YYYY"),
        status: req.status,
        oldShift: req.oldShift?.name || "-",
        targetShift: req.targetShift?.name || "-"
      }))
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      <div className="flex-1 bg-slate-50/50">
        <Calendar
          calendarMap={calendarMap}
          todayActivity={todayActivity}
          historyData={historyData}
        />
      </div>
    </div>
  )
}
