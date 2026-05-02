"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"
import { formatTime } from "@/_functions/globalFunction"

export default function ShiftModalGrid({
  dates,
  assignmentMap,
  availableShifts,
  individualValues,
  setIndividualValues,
  isEdit = false
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1 pr-2">
      {dates.map(dateStr => {
        const dateObj = new Date(dateStr)
        const currentAssignment = assignmentMap[dateStr]
        const currentShift = currentAssignment?.shift

        return (
          <div
            key={dateStr}
            className="flex flex-col gap-2 p-3 rounded-md border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">{format(dateObj, "dd MMM yyyy")}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {format(dateObj, "EEEE")}
              </span>
            </div>

            {isEdit && currentShift && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-100 rounded-lg px-2 py-1.5 shadow-xs">
                <span className="font-semibold text-slate-600">{currentShift.name}</span>
                <ArrowRight className="w-3 h-3 opacity-50" />
                <span className="opacity-70">{formatTime(currentShift.startTime)} - {formatTime(currentShift.endTime)}</span>
              </div>
            )}

            <Select
              value={individualValues[dateStr] || ""}
              onValueChange={(val) => {
                setIndividualValues(prev => ({
                  ...prev,
                  [dateStr]: val
                }))
              }}
            >
              <SelectTrigger className="w-full h-9 bg-white border-slate-200 rounded-lg text-sm">
                <SelectValue placeholder="Select shift..." />
              </SelectTrigger>
              <SelectContent>
                {availableShifts.map(s => (
                  <SelectItem key={s.id} value={String(s.id)} className="text-sm">
                    {s.name} ({s.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
    </div>
  )
}
