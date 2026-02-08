"use client"

import { Settings, Clock, Users, Calendar } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/_lib/utils"

const tabs = [
  {
    label: "General",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
  {
    label: "System Rules",
    href: "/admin/dashboard/settings/shift",
    icon: Clock,
  },
  {
    label: "Users & Roles",
    href: "/admin/dashboard/settings/users",
    icon: Users,
  },
  {
    label: "Calendar",
    href: "/admin/dashboard/settings/calendar",
    icon: Calendar,
  },
]

export function SettingsTabs() {
  const pathname = usePathname()

  return (
    <div className="mb-6">
      <div className="inline-flex rounded-lg border bg-slate-200/70 p-1 gap-1">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            pathname.startsWith(`${tab.href}/`)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-yellow-500 shadow"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
