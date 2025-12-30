"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Users, Repeat, Bell } from "lucide-react"

import { Button } from "@/_components/ui/Button"

import { capitalize } from "@/_function/globalFunction"
import { frequencyStyles } from "@/_constants/scheduleConstants"

export default function ScheduleListDetails({ schedule }) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const MAX_VISIBLE = 5
  const visibleUsers = expanded
    ? schedule.users
    : schedule.users.slice(0, MAX_VISIBLE)

  const hiddenCount = schedule.users.length - MAX_VISIBLE

  return (
    <div className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-600">
            {schedule.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            {schedule.description}
          </p>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            className="p-2 rounded-lg hover:bg-slate-100 transition"
            title="Remember me"
          >
            <Bell className="w-4 h-4 text-slate-500" />
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600"
          >
            Back
          </Button>
        </div>
      </div>

      <div className="space-y-4 border-l border-slate-200 pl-5">
        <div className="flex items-center space-x-6 gap-x-4 rounded-lg py-4">
          <TreeItem
            icon={<CalendarDays />}
            label="Start Date"
            value={`${schedule.dateRange.start} — ${schedule.timeRange.start}`}
          />
          <TreeItem
            icon={<CalendarDays />}
            label="End Date"
            value={`${schedule.dateRange.end} — ${schedule.timeRange.end}`}
          />
          <TreeItem
            icon={<Repeat />}
            label="Frequency"
            value={capitalize(schedule.frequency)}
            styleOn
          />
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
            <Users className="w-4 h-4 text-slate-400" />
            Assigned Users
          </div>

          <ul className="space-y-2 border-l border-slate-200 pl-4 max-w-sm">
            {visibleUsers.map((user) => (
              <li key={user.id} className="flex items-center gap-3 text-sm text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full bg-white">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
                  {user.initial}
                </span>

                <div className="flex flex-col leading-tight">
                  <span className="text-slate-700">{user.name}</span>
                  <span className="text-slate-400 text-xs">{user.email}</span>
                </div>
              </li>
            ))}

            {schedule.users.length > MAX_VISIBLE && (
              <li>
                <button onClick={() => setExpanded((prev) => !prev)} className="text-xs font-medium text-slate-500 hover:text-slate-700 transition pl-1">
                  {expanded
                    ? "Show less"
                    : `Show more (${hiddenCount})`}
                </button>
              </li>
            )}

          </ul>
        </div>
      </div>
    </div>
  )
}

function TreeItem({ icon, label, value, styleOn }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="bg-slate-200 p-2 rounded-lg text-slate-600">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
      </span>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </div>
        <div className={`bg-white ${styleOn ? frequencyStyles[value] : "font-medium text-slate-700"}`}>
          {value}
        </div>
      </div>
    </div>
  )
}
