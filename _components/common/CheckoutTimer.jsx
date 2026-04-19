"use client"

import { minutesToTime } from "@/_functions/globalFunction"
import { useCheckoutTimer } from "@/_stores/useCheckoutTimer"
import { Clock } from "lucide-react"

function format(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000))
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function getProgressLabel(progress) {
    if (progress <= 35) return "You've just started, keep going ..."
    if (progress <= 55) return "Almost Done, Be Patient ..."
    return "A little bit more ..."
}

function getProgressColor(progress) {
    if (progress <= 35) return "bg-red-500"
    if (progress <= 55) return "bg-yellow-400"
    return "bg-green-500"
}

export function CheckoutTimer({ attendance }) {
    if (!attendance?.shift || !attendance?.attendance) {
        return null
    }

    const workStart =
        attendance?.attendance?.checkInTime

    if (!workStart) {
        return (
            <div className="p-4 text-sm text-red-500 border rounded">
                WorkStart belum ada (belum check-in)
            </div>
        )
    }

    const { elapsed, remaining, progress, isOvertime } =
        useCheckoutTimer(
            workStart,
            attendance.shift.startTime,
            attendance.shift.endTime
        )

    console.log({
        attendance,
        shift: attendance?.shift,
    })

    return (
        <div className="p-4 rounded-xl border bg-white space-y-3">

            <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="">
                    <Clock />
                </div>
                <div className="flex flex-col">
                    <div>Shift: <b>{attendance.shift.name}</b></div>
                    <div>Work Hours: {minutesToTime(attendance.shift.startTime)} - {minutesToTime(attendance.shift.endTime)}</div>
                </div>
            </div>

            <div className="text-2xl font-bold">
                {format(elapsed)}
            </div>

            <div className={isOvertime ? "text-red-500" : "text-slate-500"}>
                {isOvertime
                    ? "Lembur mode aktif 😈"
                    : `Sisa waktu: ${format(remaining)}`
                }
            </div>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="text-xs text-slate-400">
                {getProgressLabel(progress)} ({progress.toFixed(1)}%)
            </div>
        </div>
    )
}
