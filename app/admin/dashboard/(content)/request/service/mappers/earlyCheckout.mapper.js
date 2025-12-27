async function getEarlyCheckoutRequests(mode) {
  return prisma.earlyCheckoutRequest.findMany({
    where: {
      status: mode === "history" ? { not: "PENDING" } : "PENDING",
    },
    orderBy: { requestedAt: "desc" },
    select: {
      id: true,
      reason: true,
      status: true,
      requestedAt: true,
      user: { select: { name: true, email: true } },
    },
  })
}
