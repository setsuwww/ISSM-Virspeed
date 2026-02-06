"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/_lib/utils"

const tabs = [
  { label: "Profile", href: "/admin/dashboard/profiles" },
  { label: "Security", href: "/admin/dashboard/profiles/security" },
  { label: "Log", href: "/admin/dashboard/profiles/log" },
]

export default function ProfileTabsLayout() {
  const pathname = usePathname()

  return (
    <div className="space-y-6 mb-4">
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-md",
                active
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
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
