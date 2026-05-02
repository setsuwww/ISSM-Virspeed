"use client"

import { useRouter } from "next/navigation"

import { CalendarDays, Clock, Bell, Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/_components/ui/Badge"

import { frequencyStyles } from "@/_components/_constants/theme/scheduleTheme"
import { getInitial } from "@/_functions/globalFunction"
import { createReminder, deleteSchedule } from "@/_servers/employee-services/schedule_action"

export default function EventList({ schedules }) {
  const router = useRouter()

  const handleRemember = async (id) => {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return

    await createReminder(id)
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this schedule?")) return
    await deleteSchedule(id)
  }

  return (
    <div className="flex flex-col gap-y-4">
      {schedules.map((item) => {

        const usersPreview = item.usersPreview ?? []
        const date = item.startDate ? new Date(item.startDate) : null
        const day = date ? format(date, "d") : "-"
        const weekday = date ? format(date, "EEE") : "-"
        const monthYear = date ? format(date, "dd MMMM yyyy") : "-"

        return (
          <div key={item.id} className="w-full rounded-2xl border border-slate-200 bg-white shadow-xs px-3 py-3 flex items-center gap-4">
            <div className="flex flex-col space-y-1 items-center justify-center w-16 h-16 bg-slate-200/40 rounded-lg">
              <span className="text-red-600 text-2xl font-semibold leading-none">
                {day}
              </span>
              <span className="text-slate-500 text-xs leading-none">
                {weekday}
              </span>
            </div>

            <div className="w-[0.5px] h-10 bg-slate-300 rounded-full" />

            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="text-md font-semibold text-slate-600">
                  {item.title}
                </span>

                <Badge className={frequencyStyles[item.frequency]}>
                  {item.frequency}
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

            <div className="w-[0.5px] h-10 bg-slate-300 rounded-full" />

            <div className="flex flex-col flex-4">
              <span className="text-xs font-medium text-slate-600">
                {item.totalUsers} Users Assigned
              </span>

              <div className="flex items-center mt-1">
                {usersPreview.slice(0, 5).map((user, index) => (
                  <div key={user.id}
                    className={`w-7 h-7 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 text-[10px] font-semibold border-2 border-white
                      ${index !== 0 ? "-ml-2" : ""}
                    `}
                    title={user.name}
                  >
                    {getInitial(user.name)}
                  </div>
                ))}

                {item.totalUsers > 5 && (
                  <div
                    className="
                      w-7 h-7 rounded-full flex items-center justify-center
                      bg-slate-200 text-slate-500 text-[10px] font-semibold
                      border-2 border-white -ml-2
                    "
                  >
                    +{item.totalUsers - 5}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-2">
              {/* Details (text button) */}
              <button
                onClick={() => router.push(`/employee/dashboard/my-schedule/${item.id}`)}
                className="text-xs font-medium text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Details
              </button>

              {/* Alarm */}
              <button
                onClick={() => handleRemember(item.id)}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
                title="Remember me"
              >
                <Bell className="w-4 h-4 text-slate-500" />
              </button>

              {/* Trash */}
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-lg hover:bg-red-50 transition"
                title="Remove"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
