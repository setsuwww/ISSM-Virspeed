import { prisma } from "@/_lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { ChevronLeft } from "lucide-react"
import ContentForm from "@/_components/common/ContentForm"
import { DashboardHeader } from "../../../DashboardHeader"
import ShiftCalendar from "./ShiftCalendar"

export const revalidate = 0

import { getNowJakarta, parseJakarta, formatJakarta } from "@/_lib/time"

export default async function AdminUserShiftSchedulePage(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const userId = params.id

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, locationId: true }
  })

  if (!targetUser) {
    redirect("/admin/dashboard/shift-assignments")
  }

  const nowJakarta = getNowJakarta()
  const selectedMonth = searchParams?.month || nowJakarta.format("YYYY-MM")

  let targetDate
  try {
    targetDate = parseJakarta(selectedMonth + "-01")
    if (!targetDate.isValid()) throw new Error()
  }
  catch (e) { targetDate = nowJakarta }

  const start = targetDate.clone().startOf("month").toDate()
  const end = targetDate.clone().endOf("month").toDate()

  const assignments = await prisma.shiftAssignment.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { shift: true },
    orderBy: { date: 'asc' }
  })
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
          <ShiftCalendar
            user={targetUser}
            assignments={assignments}
            shifts={shifts}
            selectedMonth={formatJakarta(targetDate, 'YYYY-MM')}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
