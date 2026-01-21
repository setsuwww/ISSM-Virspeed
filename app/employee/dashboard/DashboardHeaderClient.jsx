"use client"

import { LogOut, CalendarDays, Loader } from "lucide-react"
import { capitalize, minutesToTime } from "@/_function/globalFunction"
import dayjs from "@/_lib/day"
import "dayjs/locale/en"
import { useTransition } from "react"
import { LogoutAuthAction } from "@/app/auth/login/action"
import { Badge } from '@/_components/ui/Badge';
import { shiftStyles } from '@/_constants/shiftConstants';
import { TimeClock } from "./TimeClock"

dayjs.locale("en")

export default function DashboardHeaderClient({ user }) {
  const [isPending, startTransition] = useTransition()
  const today = dayjs().format("dddd, D MMMM YYYY")

  const handleLogout = () => {
    startTransition(async () => {
      LogoutAuthAction()
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

      <div className="flex items-center gap-3 text-slate-600">
        <button onClick={handleLogout} disabled={isPending} className="text-sm flex items-center font-medium space-x-1 p-2 rounded-lg text-rose-500 border border-slate-200 hover:bg-rose-500/5 hover:border-rose-600/5 transition-colors disabled:opacity-60">
          {isPending ? <Loader size={14} className="animate-spin" /> : <LogOut size={14} />}
        </button>
        <div className="flex items-center space-x-2 text-sm font-base text-slate-400">
          <div className="flex flex-col">
            <span>{today}</span>
            <TimeClock />
          </div>
        </div>
      </div>
    </header>
  )
}
