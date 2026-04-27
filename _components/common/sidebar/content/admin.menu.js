import { LayoutDashboard, Users, Building2, Clock, User } from "lucide-react"

export const iconMap = { LayoutDashboard, Users, Building2, Clock, User }

export const adminMenu = [
  {
    type: "link",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard"
  },
  {
    type: "group",
    label: "Users",
    icon: "Users",
    items: [
      { label: "Users", href: "/admin/dashboard/users" },
      { label: "Add Users", href: "/admin/dashboard/users/create" }
    ]
  },
  {
    type: "group",
    label: "Location",
    icon: "Building2",
    items: [
      { label: "Locations", href: "/admin/dashboard/users/locations" },
      { label: "Shift Employees", href: "/admin/dashboard/users/employees/shift-employees" },
      { label: "Normal Employees", href: "/admin/dashboard/users/employees/normal-employees" },
      { label: "Attendances", href: "/admin/dashboard/users/attendances" },
      { label: "Requests", href: "/admin/dashboard/requests" },
      { label: "Work Hours", href: "/admin/dashboard/users/work-hours" }
    ]
  },
  {
    type: "group",
    label: "Shift",
    icon: "Clock",
    items: [
      { label: "Shifts", href: "/admin/dashboard/shifts" },
      { label: "Schedules", href: "/admin/dashboard/schedules" }
    ]
  },
  {
    type: "link",
    label: "Profile",
    href: "/admin/dashboard/profiles",
    icon: "User"
  },
]
