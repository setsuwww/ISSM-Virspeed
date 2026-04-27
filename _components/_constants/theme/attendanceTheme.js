export const attendancesStyles = {
  PRESENT: "text-emerald-600 bg-emerald-100/50 border-emerald-300/50",
  LATE: "text-yellow-600 bg-yellow-100/50 border-yellow-300/50",
  PERMISSION: "text-blue-600 bg-blue-100/50 border-blue-300/50",
  ABSENT: "text-red-600 bg-red-100/50 border-red-300/50",
  ALPHA: "text-slate-600 bg-slate-100/50 border-slate-300/50",

  APPROVED: "text-white bg-emerald-500 border-emerald-500",
  REJECTED: "text-white bg-red-500 border-red-500",
  PENDING: "text-white bg-yellow-500 border-yellow-500",
  "PENDING": "text-white bg-yellow-500 border-yellow-500",
}

export const attendanceAction = {
  teal: {
    border: "border-emerald-200 hover:border-emerald-300",
    iconBg: "bg-emerald-100/50 text-emerald-600",
    title: "text-emerald-700",
    desc: "text-emerald-500",
  },
  rose: {
    border: "border-red-200 hover:border-red-300",
    iconBg: "bg-red-100/50 text-red-600",
    title: "text-red-700",
    desc: "text-red-500",
  },
  "gowsh-amber": {
    border: "ring ring-orange-700 border-0 border-t border-orange-400 hover:border-orange-300",
    iconBg: "bg-orange-600 text-white group-hover:bg-orange-700 group-active:bg-orange-800",
    title: "text-orange-700",
    desc: "text-orange-500",
  },
  "gowsh-blue": {
    border: "ring ring-blue-700 border-0 border-t border-blue-400 hover:border-blue-300",
    iconBg: "bg-blue-600 text-white group-hover:bg-blue-700 group-active:bg-blue-800",
    title: "text-blue-700",
    desc: "text-blue-500",
  },
  "gowsh-violet": {
    border: "ring ring-violet-700 border-0 border-t border-violet-400 hover:border-violet-300",
    iconBg: "bg-violet-600 text-white group-hover:bg-violet-700 group-active:bg-violet-800",
    title: "text-violet-700",
    desc: "text-violet-500",
  },
  slate: {
    border: "ring ring-slate-700 border-0 border-t border-slate-400 hover:border-slate-300",
    iconBg: "bg-slate-600 text-white group-hover:bg-slate-700 group-active:bg-slate-800",
    title: "text-slate-700",
    desc: "text-slate-500",
  },
}

export const dotStatusColor = {
  PENDING: "bg-yellow-400",
  PENDING_TARGET: "bg-yellow-400",
  PENDING_ADMIN: "bg-yellow-400",
  APPROVED: "bg-emerald-400",
  REJECTED: "bg-red-400",
};

export const attendanceStatusClass = {
  ABSENT: {
    bgDot: "bg-red-400",

    head: "text-red-800",
    text: "text-red-600",
    subtext: "text-red-400",
    border: "bg-red-50 border-red-100/50 text-red-600"
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
