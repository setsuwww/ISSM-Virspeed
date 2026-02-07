"use client"

import { User, Shield, FileText } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/_lib/utils"

const tabs = [
  { label: "Profile", href: "/admin/dashboard/profiles", icon: User  },
  { label: "Log Activity", href: "/admin/dashboard/profiles/log", icon: FileText },
  { label: "Security", href: "/admin/dashboard/profiles/security", icon: Shield },
]

export default function ProfileTabs() {
  const pathname = usePathname()

  return (
    <div className="mb-6">
      <div className="inline-flex rounded-lg border bg-slate-200 p-1">
        {tabs.map(tab => {
          const active = pathname === tab.href

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-yellow-500 shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
