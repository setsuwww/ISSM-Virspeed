"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Icons from "lucide-react"
import { cn } from "@/_lib/utils"

const linkBase = "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"

export default function EmployeeSidebarLink({ href, icon, children, badge }) {
  const pathname = usePathname()
  const Icon = Icons[icon]
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
        <span className="ml-auto text-[10px] bg-sky-100 text-sky-700 px-3 py-0.5 rounded-sm">
          {badge}
        </span>
      )}
    </Link>
  )
}
