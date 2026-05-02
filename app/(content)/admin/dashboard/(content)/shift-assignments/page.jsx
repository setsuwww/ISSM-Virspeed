import { prisma } from "@/_lib/prisma"

import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { DashboardHeader } from "../../DashboardHeader"

import ShiftAssignment from "./ShiftAssignment"

export const revalidate = 0

export default async function AdminShiftAssignmentsPage() {
  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      location: { select: { name: true } },
      shift: { select: { type: true, startTime: true, endTime: true } }
    }
  })

  return (
    <section className="space-y-6">
      <DashboardHeader title="Shifts" subtitle="Manage shifts data" />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            title="Shift Assignments"
            subtitle="Manage schedule assignments for all employees"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <ShiftAssignment users={users} />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
