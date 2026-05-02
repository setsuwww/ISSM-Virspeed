import { LayoutDashboard, Users, Building2, Clock, User } from "lucide-react"

export const iconMap = { LayoutDashboard, Users, Building2, Clock, User }

export const adminMenu = [
    {
        type: "link",
        label: "Dashboard",
        href: "/supervisor/dashboard",
        icon: "LayoutDashboard"
    },
    {
        type: "link",
        label: "Shifts",
        href: "/supervisor/dashboard/shifts",
        icon: "Clock"
    },
    {
        type: "group",
        label: "Employees",
        icon: "Users",
        items: [
            { label: "Shift Employees", href: "/supervisor/dashboard/employees/shift-employees" },
            { label: "Normal Employees", href: "/supervisor/dashboard/employees/normal-employees" },
        ]
    },
    {
        type: "link",
        label: "Profile",
        href: "/supervisor/dashboard/profile",
        icon: "User"
    },
]
