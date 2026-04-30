import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { ChevronLeft } from "lucide-react"
import { startOfMonth, endOfMonth, parseISO, format } from "date-fns"
import AdminShiftCalendarClient from "./AdminShiftCalendarClient"
import ContentForm from "@/_components/common/ContentForm"
import { DashboardHeader } from "../../DashboardHeader"

export const revalidate = 0

export default async function AdminUserShiftSchedulePage(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const userId = params.id

  const admin = await getCurrentUser()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPERVISOR")) {
    redirect("/auth/signin")
  }

  // Fetch the target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, locationId: true }
  })

  if (!targetUser) {
    redirect("/admin/dashboard/shift-assignments")
  }

  // Parse selected month from searchParams or default to current month
  const selectedMonth = searchParams?.month || format(new Date(), 'yyyy-MM')

  let targetDate
  try {
    targetDate = parseISO(`${selectedMonth}-01`)
    if (isNaN(targetDate.getTime())) throw new Error()
  } catch (e) {
    targetDate = new Date()
  }

  const start = startOfMonth(targetDate)
  const end = endOfMonth(targetDate)

  // Fetch Assignments for this user for the month
  const assignments = await prisma.shiftAssignment.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end
      }
    },
    include: {
      shift: true
    },
    orderBy: { date: 'asc' }
  })

  // Fetch all active shifts for the Dropdown/Modal
  const shifts = await prisma.shift.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  return (
    <section className="space-y-6">
      <DashboardHeader title={`${targetUser.name}'s Shift schedule`} subtitle={`Manage shifts schedules data for ${targetUser.email}`} />

      <ContentForm>
        <ContentForm.Header>
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/admin/dashboard/shift-assignments"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <ContentInformation
              title={`Schedule : ${targetUser.name}`}
              subtitle={`Manage shift assignments for ${targetUser.email}`}
              autoMargin={false}
            />
          </div>
        </ContentForm.Header>

        <ContentForm.Body>
          <AdminShiftCalendarClient
            user={targetUser}
            assignments={assignments}
            shifts={shifts}
            selectedMonth={format(targetDate, 'yyyy-MM')}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
