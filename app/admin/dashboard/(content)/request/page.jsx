export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 20

import { prisma } from "@/_lib/prisma"

import RequestsTabs from "./RequestsTabs"
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"

import { safeFormat, formatIntToTime } from "@/_function/globalFunction"

export function getWorkHours(shift, division) {
  const start = shift?.startTime ?? division?.startTime ?? null
  const end = shift?.endTime ?? division?.endTime ?? null

  return {
    startTime: start,
    endTime: end,
    label:
      start != null && end != null
        ? `${formatIntToTime(start)} - ${formatIntToTime(end)}`
        : "-",
  }
}

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
      select: {
        id: true,
        date: true,
        reason: true,
        approval: true,
        user: {
          select: {
            name: true,
            email: true,
            division: { select: { name: true, startTime: true, endTime: true } },
          },
        },
        shift: { select: { name: true, type: true, startTime: true, endTime: true } },
      },
      orderBy: { date: "desc" }
    }),

    prisma.leaveRequest.findMany({
      where: isHistory ? { status: { not: "PENDING" } } : { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reason: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            division: { select: { name: true, startTime: true, endTime: true } },
            shift: { select: { name: true, type: true, startTime: true, endTime: true } }   // TAMBAHKAN INI
          }
        },
        approvedBy: { select: { name: true, email: true } }
      }
    })
  ])

  const shift = shiftRequests.map((r) => ({
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
    status:
      r.status === "PENDING_ADMIN" || r.status === "PENDING_TARGET"
        ? "PENDING"
        : r.status,
  }))

  const attendance = attendanceRequests.map((r) => {
    const workHours = getWorkHours(r.shift, r.user?.division)

    return {
      id: `perm-${r.id}`,
      requestedBy: {
        name: r.user?.name || "-",
        email: r.user?.email || "-",
        division: r.user?.division?.name || "-",
      },
      shift: {
        name: r.shift?.name || "-",
        type: r.shift?.type || "-",
      },
      workHours,
      reason: r.reason || "-",
      info: r.shift?.type || "-",
      typeShift: r.shift?.type || "-",
      date: safeFormat(r.date, "d MMMM yyyy"),
      status: r.approval || "UNKNOWN",
    }
  })

  const leave = leaveRequests.map((r) => {
    const workHours = getWorkHours(r.user?.shift, r.user?.division)

    return {
      id: `leave-${r.id}`,
      requestedBy: {
        name: r.user?.name || "-",
        email: r.user?.email || "-",
        division: r.user?.division?.name || "-",
      },
      shift: r.user?.shift || null,
      workHours,
      reason: r.reason || "-",
      date: safeFormat(r.createdAt, "d MMMM yyyy"),
      startDate: safeFormat(r.startDate, "d MMMM yyyy"),
      endDate: safeFormat(r.endDate, "d MMMM yyyy"),
      status: r.status,
    }
  })

  return { shift, attendance, leave }
}

export default async function Page({ searchParams }) {
  const mode = searchParams?.mode || "pending"
  const { shift, attendance, leave } = await getRequests(mode)

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
