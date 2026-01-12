"use client"

import { useState } from "react"
import clsx from "clsx"

import { iconMap } from "./content/iconMap"
import { Logo } from "../Logo"

import { SidebarLink } from "./SidebarLink"
import { SidebarCollapsible } from "./SidebarCollapsible"
import SidebarUserFooter from "./SidebarUserFooter"

export default function SidebarBase({ menu, user }) {
  const [minimized, setMinimized] = useState(false)

  return (
    <aside className={clsx("h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300",
      minimized ? "w-[80px]" : "w-64"
    )}
    >
      <div className={clsx("border-b border-slate-200 flex items-center justify-between",
        minimized ? "px-4 py-[22px]" : "px-6 py-[21px]"
      )}
      >
        <Logo
          minimized={minimized}
          onToggle={() => setMinimized((v) => !v)}
        />
      </div>

      <nav className={clsx("flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300",
        minimized ? "px-2 py-4 space-y-2" : "px-4 py-5 space-y-3"
      )}
      >
        {menu.map((item) => {
          const Icon = iconMap[item.icon]
          if (!Icon) return null

          if (item.type === "link") {
            return (
              <SidebarLink key={item.href} href={item.href} activePaths={item.activePaths}
                icon={Icon} badge={item.badge}
                minimized={minimized}
              >
                {item.label}
              </SidebarLink>
            )
          }

          if (item.type === "group") {
            return (
              <SidebarCollapsible key={item.label} title={item.label}
                icon={Icon} items={item.items}
                minimized={minimized}
              />
            )
          }

          return null
        })}
      </nav>

      {user && (
        <SidebarUserFooter user={user} minimized={minimized} />
      )}
    </aside>
  )
}
