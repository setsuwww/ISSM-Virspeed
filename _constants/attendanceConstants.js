export const statusPriority = ["ABSENT", "LATE", "PERMISSION"];

export const attendancesStyles = {
  PRESENT: "text-teal-600 bg-teal-100/50 border-teal-300/50",
  LATE: "text-yellow-600 bg-yellow-100/50 border-yellow-300/50",
  PERMISSION: "text-blue-600 bg-blue-100/50 border-blue-300/50",
  ABSENT: "text-rose-600 bg-rose-100/50 border-rose-300/50",
  ALPHA: "text-slate-600 bg-slate-100/50 border-slate-300/50",

  APPROVED: "text-white bg-teal-500 border-teal-500",
  REJECTED: "text-white bg-rose-500 border-rose-500",
  PENDING: "text-white bg-yellow-500 border-yellow-500",
}

export const attendanceActionTheme = {
  teal: {
    border: "border-teal-200 hover:border-teal-300",
    iconBg: "bg-teal-100 text-teal-600",
    title: "text-teal-700",
    desc: "text-teal-500",
  },
  rose: {
    border: "border-rose-200 hover:border-rose-300",
    iconBg: "bg-rose-100 text-rose-600",
    title: "text-rose-700",
    desc: "text-rose-500",
  },
  amber: {
    border: "border-orange-200 hover:border-orange-300",
    iconBg: "bg-orange-100 text-orange-600",
    title: "text-orange-700",
    desc: "text-orange-500",
  },
  blue: {
    border: "border-blue-200 hover:border-blue-300",
    iconBg: "bg-blue-100 text-blue-600",
    title: "text-blue-700",
    desc: "text-blue-500",
  },
  violet: {
    border: "border-violet-200 hover:border-violet-300",
    iconBg: "bg-violet-100 text-violet-600",
    title: "text-violet-700",
    desc: "text-violet-500",
  },
  slate: {
    border: "border-slate-200 hover:border-slate-300",
    iconBg: "bg-slate-100 text-slate-600",
    title: "text-slate-700",
    desc: "text-slate-500",
  },
}

export const dotStatusColor = {
  PENDING: "bg-yellow-400",
  PENDING_TARGET: "bg-yellow-400",
  PENDING_ADMIN: "bg-yellow-400",
  APPROVED: "bg-teal-400",
  REJECTED: "bg-rose-400",
};

export const requestStatusDisplay = {
  PENDING: "Pending",
  PENDING_ADMIN: "Pending",
  PENDING_TARGET: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

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

export function normalizeRequestStatus(status) {
  if (status === "PENDING_ADMIN" || status === "PENDING_TARGET") {
    return "PENDING"
  }
  return status
}

export function getDisplayStatus(status) {
  return requestStatusDisplay[status] || status;
}

export const statusColorsClass = {
  ABSENT: {
    bgDot: "bg-rose-400",

    head: "text-rose-800",
    text: "text-rose-600",
    subtext: "text-rose-400",
    border: "bg-rose-50 border-rose-100/50 text-rose-600"
  },
  LATE: {
    bgDot: "bg-yellow-400",

    head: "text-yellow-800",
    text: "text-yellow-600",
    subtext: "text-yellow-400",
    border: "bg-yellow-50 border-yellow-100/50 text-yellow-600"
  },
  PERMISSION: {
    bgDot: "bg-blue-400",

    head: "text-blue-800",
    text: "text-blue-600",
    subtext: "text-blue-400",
    border: "bg-blue-50 border-blue-100/50 text-blue-600"
  },
};