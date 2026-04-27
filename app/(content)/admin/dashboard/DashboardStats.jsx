"use client"

import { ChevronRight } from "lucide-react"
import React from "react"
import Link from "next/link"

function DashboardStatsComponent({
  title, link, textlink, caption, value, valueColor = "", icon, color, dark = false, badges
}) {
  const base = "px-5 py-7 rounded-2xl flex items-center gap-4 transition-colors"
  const theme = dark ? "ring ring-slate-500 bg-slate-600 text-slate-100 hover:border-slate-200" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
  const defaultIcon = dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"

  const renderBadge = (label, value, type) => {
    if (!value) return null

    const styles = {
      ABSENT: dark
        ? "bg-red-600 text-red-50"
        : "bg-red-100/60 text-red-700",

      LATE: dark
        ? "bg-yellow-600 text-yellow-50"
        : "bg-yellow-100/60 text-yellow-700",

      PERMISSION: dark
        ? "bg-blue-600 text-blue-50"
        : "bg-blue-100/60 text-blue-700",

      PRESENT: dark
        ? "bg-green-600 text-green-50"
        : "bg-green-100/60 text-green-700",
    }

    return (
      <div className="flex items-center ml-2">
        <span
          className={`h-6 px-1.5 rounded-sm text-[10px] font-medium flex items-center justify-center ${styles[type]}`}
        >
          {label} : {value}
        </span>
      </div>
    )
  }

  return (
    <div className={`${base} ${theme}`}>
      <div className={`flex items-center justify-center w-14 h-14 rounded-full ${color || defaultIcon}`}>
        {icon}
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">{title}</h2>
          {link && (
            <Link href={link}>
              <ChevronRight strokeWidth={2} size={15}
                className={dark ? "text-slate-400" : "text-slate-500"}
              />
              {textlink}
            </Link>
          )}
        </div>
        <div className="flex items-center text-xl font-semibold">
          {caption && (<span className="mr-2">{caption}</span>)}
          <span className={valueColor}>{value}</span>

          <span className="flex">
            {renderBadge("A", badges?.ABSENT, "ABSENT")}
            {renderBadge("L", badges?.LATE, "LATE")}
            {renderBadge("Pe", badges?.PERMISSION, "PERMISSION")}
            {renderBadge("Pr", badges?.PRESENT, "PRESENT")}
          </span>
        </div>
      </div>
    </div>
  )
}

export const DashboardStats = React.memo(DashboardStatsComponent)
