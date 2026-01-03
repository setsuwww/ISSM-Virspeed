import { prisma } from "@/_lib/prisma"

export async function getShiftChangeRequests(isHistory) {
  return prisma.shiftChangeRequest.findMany({
    where: isHistory
      ? {
          status: {
            notIn: ["PENDING", "PENDING_TARGET", "PENDING_ADMIN"],
          },
        }
      : {
          status: {
            in: ["PENDING", "PENDING_TARGET", "PENDING_ADMIN"],
          },
        },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reason: true,
      status: true,
      createdAt: true,
      startDate: true,
      endDate: true,
      requestedBy: {
        select: { name: true, email: true },
      },
      targetUser: {
        select: { name: true, email: true },
      },
      oldShift: {
        select: { name: true, type: true },
      },
      targetShift: {
        select: { name: true, type: true },
      },
    },
  })
}

export async function getPermissionRequests(isHistory) {
  return prisma.attendance.findMany({
    where: {
      status: "PERMISSION",
      OR: isHistory
        ? [
            { approval: { not: "PENDING" } },
            { approval: null },
          ]
        : [{ approval: "PENDING" }],
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      reason: true,
      approval: true,
      user: {
        select: {
          name: true,
          email: true,
          division: {
            select: { name: true, startTime: true, endTime: true },
          },
        },
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
  })
}

export async function getEarlyCheckoutRequests(isHistory) {
  return prisma.earlyCheckoutRequest.findMany({
    where: isHistory
      ? {
          status: {
            not: "PENDING",
          },
        }
      : {
          status: "PENDING",
        },
    orderBy: { requestedAt: "desc" },
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
          division: {
            select: { name: true, startTime: true, endTime: true },
          },
        },
      },
      attendance: {
        select: {
          date: true,
          checkOutTime: true,
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
    },
  })
}

export async function getLeaveRequests(isHistory) {
  return prisma.leaveRequest.findMany({
    where: isHistory
      ? {
          status: {
            not: "PENDING",
          },
        }
      : {
          status: "PENDING",
        },
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
          division: {
            select: { name: true, startTime: true, endTime: true },
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
        select: { name: true, email: true },
      },
    },
  })
}
