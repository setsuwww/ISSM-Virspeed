import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/_lib/auth'
import { prisma } from '@/_lib/prisma'
import DashboardClient from './DashboardClient'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'

export default async function EmployeeDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')

  const now = new Date()
  const start = startOfMonth(subMonths(now, 1))
  const end = endOfMonth(addMonths(now, 1))

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

  const todayStr = format(now, "yyyy-MM-dd")

  // 1. Calendar Map (O(1) lookup)
  const calendarMap = assignments.reduce((acc, assignment) => {
    const key = format(new Date(assignment.date), "yyyy-MM-dd")
    acc[key] = {
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
      time: format(new Date(log.createdAt), "HH:mm"),
      rawTime: new Date(log.createdAt),
      type: log.action === "LOGOUT" ? "LOGOUT" : "LOGIN",
      label: log.action === "LOGOUT" ? "Logout" : "Login"
    })),
    // Attendance (Today)
    ...attendanceHistory
      .filter(att => format(new Date(att.date), "yyyy-MM-dd") === todayStr)
      .flatMap(att => {
        const events = []
        if (att.checkInTime) events.push({
          time: format(new Date(att.checkInTime), "HH:mm"),
          rawTime: new Date(att.checkInTime),
          type: "CHECK_IN",
          label: "Check-in"
        })
        if (att.checkOutTime) events.push({
          time: format(new Date(att.checkOutTime), "HH:mm"),
          rawTime: new Date(att.checkOutTime),
          type: "CHECK_OUT",
          label: "Check-out"
        })
        return events
      }),
    // Early Checkout Requests (Today)
    ...earlyCheckouts
      .filter(req => format(new Date(req.requestedAt), "yyyy-MM-dd") === todayStr)
      .map(req => ({
        time: format(new Date(req.requestedAt), "HH:mm"),
        rawTime: new Date(req.requestedAt),
        type: "EARLY_CHECKOUT_REQUEST",
        label: "Early Checkout Request"
      })),
    // Permission Requests (Today)
    ...permissions
      .filter(req => format(new Date(req.date), "yyyy-MM-dd") === todayStr)
      .map(req => ({
        time: req.checkInTime ? format(new Date(req.checkInTime), "HH:mm") : "00:00",
        rawTime: req.checkInTime ? new Date(req.checkInTime) : new Date(req.date),
        type: "PERMISSION_REQUEST",
        label: "Permission Request"
      })),
    // Leaves (Ongoing Today)
    ...leaves
      .filter(req => {
        const start = format(new Date(req.startDate), "yyyy-MM-dd")
        const end = format(new Date(req.endDate), "yyyy-MM-dd")
        return todayStr >= start && todayStr <= end
      })
      .map(req => ({
        time: "All Day",
        rawTime: new Date(req.startDate),
        type: "LEAVE_REQUEST",
        label: `Leave: ${req.leaveType?.name || "Request"}`
      })),
    // Shift Changes (Ongoing Today)
    ...shiftChanges
      .filter(req => {
        const start = format(new Date(req.startDate), "yyyy-MM-dd")
        const end = req.endDate ? format(new Date(req.endDate), "yyyy-MM-dd") : todayStr
        return todayStr >= start && todayStr <= end
      })
      .map(req => ({
        time: "All Day",
        rawTime: new Date(req.startDate),
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
      .filter(att => format(new Date(att.date), "yyyy-MM-dd") < todayStr)
      .map(att => ({
        id: att.id,
        dateStr: format(new Date(att.date), "dd MMM yyyy"),
        checkInStr: att.checkInTime ? format(new Date(att.checkInTime), "HH:mm") : "-",
        checkOutStr: att.checkOutTime ? format(new Date(att.checkOutTime), "HH:mm") : "-",
        status: att.status || "-"
      })),
    earlyCheckouts: earlyCheckouts
      .filter(req => format(new Date(req.requestedAt), "yyyy-MM-dd") < todayStr)
      .map(req => ({
        id: req.id,
        dateStr: req.attendance?.date ? format(new Date(req.attendance.date), "dd MMM yyyy") : "-",
        status: req.status,
        reason: req.reason ? (req.reason.length > 50 ? req.reason.substring(0, 50) + "..." : req.reason) : "-"
      })),
    permissions: permissions
      .filter(req => format(new Date(req.date), "yyyy-MM-dd") < todayStr)
      .map(req => ({
        id: req.id,
        dateStr: format(new Date(req.date), "dd MMM yyyy"),
        status: req.approval || "PENDING",
        reason: req.reason ? (req.reason.length > 50 ? req.reason.substring(0, 50) + "..." : req.reason) : "-"
      })),
    leaves: leaves
      .filter(req => format(new Date(req.endDate), "yyyy-MM-dd") < todayStr)
      .map(req => ({
        id: req.id,
        type: req.leaveType?.name || "-",
        status: req.status,
        range: `${format(new Date(req.startDate), "dd MMM")} - ${format(new Date(req.endDate), "dd MMM yyyy")}`
      })),
    shiftChanges: shiftChanges
      .filter(req => format(new Date(req.startDate), "yyyy-MM-dd") < todayStr)
      .map(req => ({
        id: req.id,
        dateStr: format(new Date(req.startDate), "dd MMM yyyy"),
        status: req.status,
        oldShift: req.oldShift?.name || "-",
        targetShift: req.targetShift?.name || "-"
      }))
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      <div className="flex-1 bg-slate-50/50">
        <DashboardClient
          calendarMap={calendarMap}
          todayActivity={todayActivity}
          historyData={historyData}
        />
      </div>
    </div>
  )
}

// Helpers
function formatTime(minutes) {
  if (minutes == null) return null
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function getShiftStyle(type) {
  switch (type) {
    case 'MORNING': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'AFTERNOON': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'EVENING': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'OFF': return 'bg-slate-50 text-slate-500 border-slate-200'
    default: return 'bg-slate-50 text-slate-500 border-slate-200'
  }
}
