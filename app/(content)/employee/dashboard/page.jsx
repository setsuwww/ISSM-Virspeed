import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/_lib/auth'
import { prisma } from '@/_lib/prisma'
import DashboardClient from './DashboardClient'
import { startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'

export default async function EmployeeDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')

  // We fetch a window of 3 months to allow some basic prev/next month navigation
  const now = new Date()
  const start = startOfMonth(subMonths(now, 1))
  const end = endOfMonth(addMonths(now, 1))

  const [
    assignments,
    attendanceHistory,
    earlyCheckouts,
    permissions,
    leaves,
    shiftChanges
  ] = await Promise.all([
    // 1. Shift Assignments for the 3-month window
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
    })
  ])

  return (
    <div className="flex-1 w-full flex flex-col">
      <div className="p-4 sm:p-6 pb-2 sm:pb-4 border-b border-slate-200 bg-white">
        <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">View your shift schedule and track your recent requests.</p>
      </div>

      <div className="flex-1 bg-slate-50/50">
        <DashboardClient
          assignments={assignments}
          attendanceHistory={attendanceHistory}
          earlyCheckouts={earlyCheckouts}
          permissions={permissions}
          leaves={leaves}
          shiftChanges={shiftChanges}
        />
      </div>
    </div>
  )
}
