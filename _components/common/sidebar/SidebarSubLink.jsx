"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

export const subLinkBase = "block my-0.5 text-sm px-3 py-1.5 transition-colors font-medium rounded-md"

export function SidebarSubLink({ href, children, minimized }) {
  const pathname = usePathname()
  const isActive = pathname === href
  if (minimized) return null

  return (
    <Link href={href} className={clsx(subLinkBase,
      isActive ? "text-yellow-600 font-semibold bg-yellow-500/10"
        : "text-slate-400 hover:text-slate-600 transition-colors"
    )}>
      {children}
    </Link>
  )
}