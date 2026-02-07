export const statusStyleKey = {
  PENDING: "Pending",
  PENDING_ADMIN: "Pending",
  PENDING_TARGET: "Pending",

  APPROVED: "Approved",
  REJECTED: "Rejected",

  ABSENT: "Absent",
  LATE: "Late",
  PERMISSION: "Permission",
};

export function normalizePendingStatus(status) {
  if (status === "PENDING_ADMIN" || status === "PENDING_TARGET") {
    return "PENDING"
  }
  return status
}

export function getAttendanceStatus(status) {
  return statusStyleKey[status] || status;
}
