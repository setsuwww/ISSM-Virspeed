"use client"

import { Calendar, Bell } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/_lib/utils"

const tabs = [
  { label: "Shift", href: "/employee/dashboard/my-schedule/shift-schedule", icon: Calendar },
  { label: "Event", href: "/employee/dashboard/my-schedule/event-schedule", icon: Bell },
]

export default function ScheduleToEvent() {
  const pathname = usePathname()

  return (
    <div className="mb-3">
      <div className="inline-flex rounded-lg border bg-slate-200/70 p-1">
        {tabs.map(tab => {
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
              <tab.icon className="mr-1.5 h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
