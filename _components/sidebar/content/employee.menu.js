import { QrCode, Clock, RefreshCcw, Calendar, User } from "lucide-react"

export const iconMap = { QrCode, Clock, RefreshCcw, Calendar, User }

export const employeeMenu = (scheduleCount) => [
  {
    type: "link",
    label: "Attendances",
    href: "/employee/dashboard/attendance/main",
    icon: "QrCode"
  },
  {
    type: "link",
    label: "History",
    href: "/employee/dashboard/attendance/history",
    icon: "Clock"
  },
  {
    type: "link",
    label: "Change Shift",
    href: "/employee/dashboard/attendance/change-shift",
    icon: "RefreshCcw"
  },
  {
    type: "link",
    label: "Your Schedule",
    href: "/employee/dashboard/my-schedule",
    icon: "Calendar",
    badge: scheduleCount
  },
  {
    type: "link",
    label: "Profile",
    href: "/employee/dashboard/profile",
    icon: "User"
  }
]
