export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 20

import { prisma } from "@/_lib/prisma"
import { safeFormat } from "@/_function/globalFunction"
import RequestsTabs from "./RequestsTabs"
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"

async function getRequests(mode = "pending") {
  const isHistory = mode === "history"

  const [shiftRequests, attendanceRequests, leaveRequests] = await Promise.all([
    prisma.shiftChangeRequest.findMany({
      where: isHistory
        ? { status: { notIn: ["PENDING", "PENDING_TARGET", "PENDING_ADMIN"] } }
        : { status: { in: ["PENDING", "PENDING_TARGET", "PENDING_ADMIN"] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        requestedBy: { select: { name: true, email: true } },
        targetUser: { select: { name: true, email: true } },
        oldShift: { select: { name: true, type: true } },
        targetShift: { select: { name: true, type: true } },
      },
    }),

    prisma.attendance.findMany({
      where: isHistory
        ? { status: "PERMISSION", approval: { not: "PENDING" } }
        : { status: "PERMISSION", approval: "PENDING" },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        reason: true,
        approval: true,
        user: {
          select: { name: true, email: true, division: { select: { name: true } } },
        },
        shift: { select: { type: true } },
      },
    }),

    prisma.leaveRequest.findMany({
      where: isHistory
        ? { status: { not: "PENDING" } }
        : { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reason: true,
        adminReason: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
        user: {
          select: { name: true, email: true, division: { select: { name: true } } }
        },
        approvedBy: {
          select: { name: true, email: true }
        }
      }
    })
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

      startDate: safeFormat(r.startDate, "d MMMM yyyy"),
      endDate: safeFormat(r.endDate, "d MMMM yyyy"),
      date: safeFormat(r.createdAt, "d MMMM yyyy"),

      status: r.status === "PENDING_ADMIN" || r.status === "PENDING_TARGET" ? "PENDING" : r.status,
    })),

    attendance: attendanceRequests.map((r) => ({
      id: `perm-${r.id}`,

      requestedBy: {
        name: r.user?.name || "-",
        email: r.user?.email || "-",
        division: r.user?.division?.name || "-",
      },

      user: null,
      reason: r.reason || "-",
      info: r.shift?.type || "-",
      typeShift: r.shift?.type || "-",

      date: safeFormat(r.date, "d MMMM yyyy"),
      status: r.approval === "PENDING" ? "PENDING" : r.approval || "UNKNOWN",
    })),

    leave: leaveRequests.map((r) => ({
      id: `leave-${r.id}`,

      requestedBy: {
        name: r.user?.name || "-",
        email: r.user?.email || "-",
        division: r.user?.division?.name || "-",
      },

      user: null,

      info: `${safeFormat(r.startDate, "d MMMM yyyy")} → ${safeFormat(r.endDate, "d MMMM yyyy")}`,
      typeShift: "LEAVE",

      reason: r.reason || "-",
      date: safeFormat(r.createdAt, "d MMMM yyyy"),
      startDate: safeFormat(r.startDate, "d MMMM yyyy"),
      endDate: safeFormat(r.endDate, "d MMMM yyyy"),

      status: r.status,
    }))
  }
}

export default async function Page({ searchParams }) {
  const mode = searchParams?.mode || "pending"
  const { shift, attendance, leave } = await getRequests(mode)

  return (
    <section>
      <DashboardHeader title="Requests"
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
          <RequestsTabs
            changeShiftRequests={shift}
            permissionRequests={attendance}
            earlyCheckoutRequests={[]}
            leaveRequests={leave}
            mode={mode}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
