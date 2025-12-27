import { prisma } from "@/_lib/prisma"

export async function getShiftRequests(statusFilter) {
  return prisma.shiftChangeRequest.findMany({
    where: { status: statusFilter },
    orderBy: { createdAt: "desc" },
    include: {
      requestedBy: true,
      targetUser: true,
      oldShift: true,
      targetShift: true,
    },
  })
}

export async function getPermissionRequests(mode) {
  return prisma.attendance.findMany({
    where: {
      status: "PERMISSION",
      approval: mode === "history" ? { not: "PENDING" } : "PENDING",
    },
    include: {
      user: { include: { division: true } },
      shift: true,
    },
  })
}

export async function getEarlyCheckoutRequests(mode) {
  return prisma.earlyCheckoutRequest.findMany({
    where: {
      status: mode === "history" ? { not: "PENDING" } : "PENDING",
    },
    include: {
      user: { include: { division: true } },
      attendance: { include: { shift: true } },
    },
  })
}

export async function getLeaveRequests(mode) {
  return prisma.leaveRequest.findMany({
    where: {
      status: mode === "history" ? { not: "PENDING" } : "PENDING",
    },
    include: {
      user: { include: { division: true, shift: true } },
      approvedBy: true,
    },
  })
}
