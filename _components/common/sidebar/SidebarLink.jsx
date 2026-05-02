"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

export function SidebarLink({ href, icon: Icon, children, minimized }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href}
      className={clsx("relative text-sm font-semibold flex items-center rounded-lg transition-all duration-200",
        minimized ? "justify-center h-12 w-12 mx-auto"
          : "gap-3 px-2 py-1.5 w-full",
        isActive ? "bg-slate-50 ring ring-slate-200 text-slate-600 font-bold border-b-2 border-0 border-slate-200"
          : "text-slate-600 border border-transparent hover:text-slate-800 hover:bg-slate-50 hover:border hover:border-slate-200"
      )}
    >
      <div className="relative">
        <div className="p-1.5 bg-violet-500/10 border rounded-md">
          <Icon className="text-violet-500 shrink-0" size={18} />
        </div>
      </div>

      {!minimized && <span className="truncate">{children}</span>}
    </Link>
  )
}
