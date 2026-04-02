import { prisma } from "@/_lib/prisma"

export async function fetchShiftRequests(isHistory) {
  return prisma.shiftChangeRequest.findMany({
    where: isHistory
      ? { status: { notIn: ["PENDING", "PENDING_TARGET", "PENDING_ADMIN"] } }
      : { status: { in: ["PENDING", "PENDING_TARGET", "PENDING_ADMIN"] } },
    orderBy: { createdAt: "desc" },
    take: 20,
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
  })
}

export async function fetchPermissionRequests(isHistory) {
  return prisma.attendance.findMany({
    where: isHistory
      ? { status: "PERMISSION", approval: { not: "PENDING" } }
      : { status: "PERMISSION", approval: "PENDING" },
    orderBy: { date: "desc" },
    take: 20,
    select: {
      id: true,
      date: true,
      reason: true,
      approval: true,
      user: {
        select: {
          name: true,
          email: true,
          location: { select: { name: true, startTime: true, endTime: true } },
        },
      },
      shift: {
        select: { name: true, type: true, startTime: true, endTime: true },
      },
    },
  })
}

export async function fetchEarlyCheckoutRequests(isHistory) {
  return prisma.earlyCheckoutRequest.findMany({
    where: isHistory
      ? { status: { not: "PENDING" } }
      : { status: "PENDING" },
    orderBy: { requestedAt: "desc" },
    take: 20,
    select: {
      id: true,
      reason: true,
      status: true,
      adminReason: true,
      requestedAt: true,
      reviewedAt: true,
      user: {
        select: {
          name: true,
          email: true,
          location: { select: { name: true, startTime: true, endTime: true } },
        },
      },
      attendance: {
        select: {
          date: true,
          checkOutTime: true,
          shift: {
            select: { name: true, type: true, startTime: true, endTime: true },
          },
        },
      },
    },
  })
}

export async function fetchLeaveRequests(isHistory) {
  return prisma.leaveRequest.findMany({
    where: isHistory
      ? { status: { not: "PENDING" } }
      : { status: "PENDING" },

    orderBy: { createdAt: "desc" },
    take: 20,

    select: {
      id: true,
      reason: true,
      adminReason: true,
      startDate: true,
      endDate: true,
      totalDays: true,
      status: true,
      createdAt: true,

      leaveType: {
        select: {
          code: true,
          name: true,
          category: true,
          maxDays: true,
        },
      },

      user: {
        select: {
          name: true,
          email: true,
          location: {
            select: { name: true },
          },
          shift: {
            select: {
              name: true,
              type: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      },

      approvedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}
