"use client"

import { attendanceActionTheme } from "@/_constants/attendanceConstants"
import clsx from "clsx"
import Link from "next/link"

export function MainActionCard({ icon, title, description, color = "slate", onClick, asLink, href }) {

  const t = attendanceActionTheme[color] ?? attendanceActionTheme.slate

  const content = (
    <div onClick={onClick}
      className={clsx("group flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all cursor-pointer")}
    >
      <div className={clsx("p-2 rounded-lg transition",
        t.iconBg, t.border
      )}
      >
        {icon}
      </div>

      <div className="flex flex-col">
        <span className={clsx("font-semibold", t.title)}>
          {title}
        </span>
        <span className={clsx("text-xs", t.desc)}>
          {description}
        </span>
      </div>
    </div>
  )

  if (asLink && href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
