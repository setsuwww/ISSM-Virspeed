"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

export function SidebarLink({ href, icon: Icon, children, minimized, badge = 0 }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href}
      className={clsx("relative text-sm font-semibold flex items-center rounded-lg transition-all duration-200",
        minimized ? "justify-center h-12 w-12 mx-auto"
          : "gap-3 px-3 py-2 w-full",
        isActive ? "bg-slate-50 ring ring-slate-200 text-slate-800"
          : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
      )}
    >
      <div className="relative">
        <div className="p-1.5 bg-yellow-600/10 rounded-md">
          <Icon className="text-yellow-500 shrink-0" size={18} />
        </div>

        {badge > 0 && minimized && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
        )}
      </div>

      {!minimized && <span className="truncate">{children}</span>}

      {badge > 0 && !minimized && (
        <span className="ml-auto text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  )
}
