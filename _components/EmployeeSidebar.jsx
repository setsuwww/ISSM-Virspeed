"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Clock,
  QrCode,
  User,
  RefreshCcw,
  Calendar,
} from "lucide-react"
import { cn } from "@/_lib/utils"

const linkBase =
  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"

function SidebarLink({ href, icon: Icon, children, badge, count }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        linkBase,
        isActive
          ? "bg-slate-100 text-slate-700 font-semibold ring-1 ring-slate-200 border-0 border-b-2 border-slate-300"
          : "text-slate-500 hover:text-slate-800"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-yellow-500" />
        {children}
      </div>

      {badge > 0 && (
        <span className="ml-auto text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  )
}


export default function EmployeeSidebar() {
  return (
    <aside className="w-64 h-screen bg-white text-sm flex flex-col border-r border-slate-200">
      <div className="text-2xl font-bold px-7 text-sky-800 py-6.5 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Image src="/icons/liveon.png" width={20} height={20} alt="Liveon icon" />
          <div className="text-xl font-bold text-sky-800">Liveon.</div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <SidebarLink href="/employee/dashboard/attendance/checkin" icon={QrCode}>
          Attendances
        </SidebarLink>
        <SidebarLink href="/employee/dashboard/attendance/history" icon={Clock}>
          History
        </SidebarLink>
        <SidebarLink href="/employee/dashboard/attendance/change-shift" icon={RefreshCcw}>
          Change Shift
        </SidebarLink>
        <SidebarLink href="/employee/dashboard/my-schedule" icon={Calendar}>
          Your Schedule
        </SidebarLink>
        <SidebarLink href="/employee/dashboard/profile" icon={User} badge={count}>
          Profile
        </SidebarLink>
      </nav>
    </aside>
  )
}
