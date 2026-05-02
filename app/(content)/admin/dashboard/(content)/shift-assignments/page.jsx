import { notFound } from "next/navigation"

import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { DashboardHeader } from "../../DashboardHeader"

import ShiftAssignment from "./ShiftAssignment"
import { Pagination } from "../../Pagination"

import { getUsers, getUserCount } from "@/_servers/admin-services/user_action"

export const revalidate = 60

export default async function AdminShiftAssignmentsPage({ searchParams }) {
  const params = await searchParams

  const page = Number(params?.page) || 1
  const allowedLimits = [10, 20, 30]
  const limit = allowedLimits.includes(Number(params?.limit)) ? Number(params?.limit) : 10

  const where = { role: "EMPLOYEE" }

  const [users, total] = await Promise.all([
    getUsers(page, limit, where),
    getUserCount(where),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (page > totalPages && totalPages > 0) return notFound()

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

          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/dashboard/shift-assignments"
            limit={limit}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
