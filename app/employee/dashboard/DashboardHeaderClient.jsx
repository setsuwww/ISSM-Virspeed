"use client"

import { LogOut, CalendarDays } from "lucide-react"
import { capitalize, minutesToTime } from "@/_function/globalFunction"
import dayjs from "@/_lib/day"
import "dayjs/locale/en"
import { useTransition } from "react"
import { LogoutAuthAction } from "@/app/auth/login/action"
import { Badge } from '@/_components/ui/Badge';
import { shiftStyles } from '@/_constants/shiftConstants';

dayjs.locale("en")

export default function DashboardHeaderClient({ user }) {
  const [isPending, startTransition] = useTransition()
  const today = dayjs().format("dddd, D MMMM YYYY")

  const handleLogout = () => {
    startTransition(async () => {
      const res = await LogoutAuthAction()
      if (res.success) { window.location.href = "/auth/login" }
      else { alert(res.message) }
    })
  }

  return (
    <header className="w-full flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-white">
      <div>
        <div className="flex items-center gap-3 text-slate-600">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-semibold text-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="flex flex-col">
            <h1 className="text-md md:text-lg font-semibold flex items-center space-x-1">
              <span><span className="text-sky-700">{capitalize(user?.name ?? "User")}’s</span> Dashboard</span>
              <Badge className={shiftStyles[user.shift?.type]}>{capitalize(user.shift?.type)}</Badge>
            </h1>
            <span className="text-xs text-slate-400">{minutesToTime(user.shift?.startTime)} - {minutesToTime(user.shift?.endTime)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 text-sm font-medium text-slate-400">
          <CalendarDays size={14} className="text-sky-500" />
          <span>{today}</span>
        </div>

        <button onClick={handleLogout} disabled={isPending} className="text-sm flex items-center font-medium space-x-1 px-3 py-1.5 rounded-lg text-rose-500 border border-slate-200 transition-colors disabled:opacity-60">
          <LogOut size={14} />
          <span className="text-slate-600">
            {isPending ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  )
}
