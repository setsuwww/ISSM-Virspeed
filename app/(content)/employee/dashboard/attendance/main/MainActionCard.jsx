"use client"

import { attendanceAction } from "@/_constants/theme/attendanceTheme"
import clsx from "clsx"
import Link from "next/link"
import { Plus, X } from "lucide-react"
import { useState } from "react"

export function MainActionCard({
  icon,
  title,
  description,
  color = "slate",
  onClick,
  asLink,
  href,

  variant,
  dropdownItems = [],
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

      {isDual && (
        <div className="p-1 bg-gray-100 group-hover:bg-gray-200/60 rounded-full">
          <Plus strokeWidth={1.5} className={`transition duration-100 ${open ? "rotate-45" : "rotate-0"}`} />
        </div>
      )}

      {isDual && open && (
        <div
          className={clsx(
            "absolute top-full left-0 mt-2 w-full rounded-lg border border-slate-300 bg-white shadow-sm z-50",
            "transition-all duration-150 ease-out",
            open
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
          )}
        >
          {dropdownItems.map((item, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                item.onClick?.()
              }}
              className="px-4 py-3 text-sm rounded-lg cursor-pointer flex items-center gap-3"
            >
              <div className={clsx(item.bgColor, "p-2 rounded-md")}>
                {item.icon}
              </div>
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (!isDual && asLink && href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
