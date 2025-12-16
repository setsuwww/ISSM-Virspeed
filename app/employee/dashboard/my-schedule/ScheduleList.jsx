"use client"

import { CalendarDays, Clock, MoreVertical } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/_components/ui/Badge"
import { frequencyStyles } from "@/_constants/scheduleConstants"
import { capitalize } from "@/_function/globalFunction"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/_components/ui/Dropdown-menu"

export default function ScheduleList({ schedules }) {
  const handleDetails = (id) => {
    console.log("Details:", id)
  }

  const handleRemember = (id) => {
    console.log("Remember Me:", id)
  }

  const handleDelete = (id) => {
    console.log("Delete:", id)
  }

  return (
    <div className="flex flex-col gap-4">
      {schedules.map((item) => {
        const date = item.startDate ? new Date(item.startDate) : null
        const day = date ? format(date, "d") : "-"
        const weekday = date ? format(date, "EEE") : "-"
        const monthYear = date ? format(date, "dd MMMM yyyy") : "-"

        return (
          <div
            key={item.id}
            className="w-full rounded-2xl border border-slate-100 bg-white shadow-xs px-3 py-3 flex items-center gap-4"
          >

            <div className="flex flex-col space-y-1 items-center justify-center w-16 h-16 bg-slate-200/40 rounded-lg">
              <span className="text-red-600 text-2xl font-semibold leading-none">
                {day}
              </span>
              <span className="text-slate-500 text-xs leading-none">
                {weekday}
              </span>
            </div>

            {/* Divider */}
            <div className="w-[0.5px] h-10 bg-slate-300 rounded-full" />

            {/* Main Info */}
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="text-md font-semibold text-slate-600">
                  {item.title}
                </span>

                <Badge className={frequencyStyles[capitalize(item.frequency)]}>
                  {capitalize(item.frequency)}
                </Badge>
              </div>

              <div className="flex items-center mt-1 gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" strokeWidth={1.5} />
                  <span>{item.startTime || "-"}</span>
                </div>

                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" strokeWidth={1.5} />
                  <span>{monthYear}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full hover:bg-slate-100">
                  <MoreVertical className="w-5 h-5 text-slate-600" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleDetails(item.id)}>
                  Details
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleRemember(item.id)}>
                  Remember Me
                </DropdownMenuItem>

                <hr className="my-1.5 h-[0.5px] border border-slate-100 bg-slate-100" />

                <DropdownMenuItem
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      })}
    </div>
  )
}
