import { QrCode, Clock, RefreshCcw, Calendar, User, LayoutDashboard } from "lucide-react"

export const iconMap = { QrCode, Clock, RefreshCcw, Calendar, User, LayoutDashboard }

export const employeeMenu = (changeShiftCount, scheduleCount) => [
  {
    type: "link",
    label: "Dashboard",
    href: "/employee/dashboard",
    icon: "LayoutDashboard"
  },
  {
    type: "link",
    label: "Attendances",
    href: "/employee/dashboard/attendance/main",
    icon: "QrCode"
  },
  {
    type: "group",
    label: "History",
    icon: "Clock",
    items: [
      { label: "Attendance", href: "/employee/dashboard/attendance/history" },
      { label: "Permission", href: "/employee/dashboard/attendance/history/permission" },
      { label: "Leave", href: "/employee/dashboard/attendance/history/leave" },
      { label: "Early Checkout", href: "/employee/dashboard/attendance/history/early-checkout" },
      { label: "Change Shift", href: "/employee/dashboard/attendance/change-shift" },
    ]
  },
  {
    type: "group",
    label: "Schedule",
    icon: "Calendar",
    items: [
      { label: "Shift Schedule", href: "/employee/dashboard/my-schedule/shift-schedule" },
      { label: "Event Schedule", href: "/employee/dashboard/my-schedule/event-schedule" },
    ],
    badge: scheduleCount
  },
  {
    type: "link",
    label: "Profile",
    href: "/employee/dashboard/profile",
    icon: "User"
  }
]
