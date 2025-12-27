async function getLeaveRequests(mode) {
  return prisma.leaveRequest.findMany({
    where: {
      status: mode === "history" ? { not: "PENDING" } : "PENDING",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reason: true,
      startDate: true,
      endDate: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  })
}
