"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Clock,
  QrCode,
  User,
  RefreshCcw,
} from "lucide-react"
import SubHeading from "./common/SubHeading"
import { cn } from "@/_lib/utils"

const linkBase =
  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"

function SidebarLink({ href, icon: Icon, children }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} className={cn(
      linkBase, isActive
        ? "bg-slate-100 text-slate-700 font-semibold ring-1 ring-slate-200 border-0 border-b-2 border-slate-300"
        : "text-slate-500 hover:text-slate-800"
      )}
    >
      <Icon size={18} className="text-yellow-500" />
      {children}
    </Link>
  )
}

export default function EmployeeSidebar() {
  return (
    <aside className="w-64 h-screen bg-white text-sm flex flex-col border-r border-slate-200">
      <div className="text-2xl font-bold px-7 text-sky-800 py-6 border-b border-slate-200">
        Live<span className="text-sky-600">system.</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <SubHeading title="Attendance" />
        <SidebarLink
          href="/employee/dashboard/attendance/checkin"
          icon={QrCode}
        >
          Attendances
        </SidebarLink>
        <SidebarLink href="/employee/dashboard/attendance/history" icon={Clock}>
          History
        </SidebarLink>

        <SubHeading title="Calendar" />
        <SidebarLink
          href="/employee/dashboard/attendance/change-shift"
          icon={RefreshCcw}
        >
          Change Shift
        </SidebarLink>

        <SubHeading title="Account" />
        <SidebarLink href="/employee/dashboard/profile" icon={User}>
          Profile
        </SidebarLink>
      </nav>
    </aside>
  )
}
