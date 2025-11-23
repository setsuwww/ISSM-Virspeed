export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 20

import { prisma } from "@/_lib/prisma"
import RequestsTabs from "./RequestsTabs"
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"

async function getRequests(mode = "pending") {
  const isHistory = mode === "history"

  const [shiftRequests, attendanceRequests] = await Promise.all([
    prisma.shiftChangeRequest.findMany({
      where: isHistory ? {}
        : { OR: [{ status: "PENDING_ADMIN" }, { status: "PENDING_TARGET" }]},
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reason: true, status: true,
        createdAt: true,
        startDate: true, endDate: true,
        requestedBy: { select: { name: true, email: true } },
        targetUser: { select: { name: true, email: true } },
        oldShift: { select: { name: true, type: true } },
        targetShift: { select: { name: true, type: true } },
      },
    }),

    prisma.attendance.findMany({
      where: isHistory ? {} : { status: "PERMISSION", approval: "PENDING" },
      orderBy: { date: "desc" },
      select: {
        id: true, date: true,
        reason: true, approval: true,
        user: {
          select: {
            name: true, email: true, division: { select: { name: true } },
          },
        },
        shift: { select: { type: true } },
      },
    }),
  ])

  return {
    shift: shiftRequests.map((r) => ({
      id: `shift-${r.id}`,
      requestedBy: {
        name: r.requestedBy?.name || "-",
        email: r.requestedBy?.email || "-",
      },
      user: {
        name: r.targetUser?.name || "-",
        email: r.targetUser?.email || "-",
      },
      oldShift: {
        name: r.oldShift?.name || "-",
        type: r.oldShift?.type || "-",
      },
      targetShift: {
        name: r.targetShift?.name || "-",
        type: r.targetShift?.type || "-",
      },
      info: `${r.oldShift?.name || "?"} (${r.oldShift?.type || "-"}) → ${r.targetShift?.name || "?"} (${r.targetShift?.type || "-"})`,
      typeShift: r.targetShift?.type || r.oldShift?.type || "-",
      reason: r.reason || "-",
      startDate: r.startDate
        ? new Date(r.startDate).toLocaleDateString("en-US", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })
        : "-",
      endDate: r.endDate
        ? new Date(r.endDate).toLocaleDateString("en-US", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })
        : "-",
      date: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString("en-US", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })
        : "-",
      status: r.status === "PENDING_ADMIN" || r.status === "PENDING_TARGET" ? "PENDING" : r.status,
    })),

    attendance: attendanceRequests.map((r) => ({ id: `perm-${r.id}`,
      requestedBy: {
        name: r.user?.name || "-", email: r.user?.email || "-",
        division: r.user?.division?.name || "-",
      },
      user: null,
      reason: r.reason || "-",
      info: r.shift?.type || "-",
      typeShift: r.shift?.type || "-",
      date: r.date
        ? new Date(r.date).toLocaleDateString("en-US", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })
        : "-",
      status: r.approval === "PENDING" ? "PENDING" : r.approval || "UNKNOWN",
    })),
  }
}

export default async function Page({ searchParams }) {
  const mode = searchParams?.mode || "pending"
  const { shift, attendance } = await getRequests(mode)

  return (
    <section>
      <DashboardHeader
        title="Requests"
        subtitle={mode === "history" ? "All requests history" : "Manage pending requests by type"}
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            heading={mode === "history" ? "Request History" : "Pending Requests"}
            subheading="Switch between Shift Change and Permission requests"
            show={false}
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <RequestsTabs shiftRequests={shift} permissionRequests={attendance} mode={mode}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
