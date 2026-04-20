"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/_lib/utils"

const tabs = [
  {
    label: "Attendance",
    href: "/employee/dashboard/attendance/history",
  },
  {
    label: "Change Shift",
    href: "/employee/dashboard/attendance/history/change-shift",
  },
  {
    label: "Leave",
    href: "/employee/dashboard/attendance/history/leave",
  },
]

export default function HistoryAnotherTabs() {
  const pathname = usePathname()

  return (
    <div>
      <div className="inline-flex rounded-lg border bg-slate-200/70 p-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-yellow-500 shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
