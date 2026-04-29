import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { Calendar } from "lucide-react"

export const revalidate = 0

export default async function AdminShiftAssignmentsPage() {
  const admin = await getCurrentUser()
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPERVISOR")) {
    redirect("/auth/signin")
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      location: { select: { name: true } },
      shift: { select: { name: true } }
    }
  })

  return (
    <ContentForm>
      <ContentForm.Header>
        <ContentInformation
          title="Shift Assignments"
          subtitle="Manage schedule assignments for all employees"
        />
      </ContentForm.Header>

      <ContentForm.Body>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Employee Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Default Shift</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{user.location?.name || '-'}</td>
                      <td className="px-6 py-4">{user.shift?.name || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/dashboard/shift-assignments/${user.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          View Schedule
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ContentForm.Body>
    </ContentForm>
  )
}
