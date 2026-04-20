"use client"

import { attendanceAction } from "@/_constants/theme/attendanceTheme"
import clsx from "clsx"
import Link from "next/link"
import { AlertTriangle, Plus } from "lucide-react"
import { useState } from "react"
import { cn } from "@/_lib/utils"

export function MainActionCard({
  icon, title, description, color = "slate", onClick, asLink, href,
  variant, dropdownItems = [], forgotCheckout,
}) {
  const t = attendanceAction[color] ?? attendanceAction.slate
  const [open, setOpen] = useState(false)

  const isDual = variant === "dual"

  const baseClass =
    "group relative flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-all cursor-pointer"

  const handleClick = () => {
    if (isDual) {
      setOpen((prev) => !prev)
    } else {
      onClick?.()
    }
  }

  const content = (
    <div onClick={handleClick} className={baseClass}>
      <div className={clsx("p-2 rounded-lg transition", t.iconBg, t.border)}>
        {icon}
      </div>

      <div className="flex flex-col flex-1">
        <span className={clsx("font-semibold", t.title)}>
          {title}
        </span>
        <span className={clsx("text-xs", t.desc)}>
          {description}
        </span>
      </div>
      {forgotCheckout && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">
            May you forgot to checkout?
          </span>
        </div>
      )}


      {isDual && (
        <div className="p-1.5 bg-slate-100/80 group-hover:bg-slate-200 rounded-full transition">
          <Plus
            strokeWidth={1.8}
            className={cn(
              "transition-transform duration-200",
              open ? "rotate-45" : "rotate-0"
            )}
          />
        </div>
      )}

      {isDual && (
        <div
          className={clsx(
            "absolute top-full left-0 mt-2 w-56 rounded-md border border-slate-200 bg-white/95 backdrop-blur",
            "shadow-lg shadow-slate-900/5 z-50 origin-top",
            "transition-all duration-200 ease-out",
            open
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          )}
        >
          <div className="p-1">
            {dropdownItems.map((item, i) => (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                  item.onClick?.()
                }}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer",
                  "transition-all duration-150",
                  "hover:bg-slate-50 active:scale-[0.98]"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-md p-2",
                    item.bgColor
                  )}
                >
                  {item.icon}
                </div>

                <span className="text-slate-700 group-hover:text-slate-900 font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (!isDual && asLink && href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
