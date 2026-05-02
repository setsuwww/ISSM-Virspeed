"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, startOfMonth, startOfWeek, endOfWeek, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, List as ListIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/Card"
import { Badge } from "@/_components/ui/Badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/Tooltip"
import { getShiftStyle } from "@/_components/_constants/shiftConstants"
import { formatTime } from "@/_functions/globalFunction"

export default function ShiftList({ assignments, selectedMonth }) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState("calendar") // "calendar" or "list"

  const currentDate = parseISO(selectedMonth + "-01")
  const start = startOfMonth(currentDate)
  const end = endOfMonth(currentDate)

  const firstDayOfMonth = start.getDay()
  const emptyDays = Array(firstDayOfMonth).fill(null)

  const handlePrevMonth = () => {
    const prev = subMonths(currentDate, 1)
    router.push(`?month=${format(prev, "yyyy-MM")}`)
  }

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1)
    router.push(`?month=${format(next, "yyyy-MM")}`)
  }

  const calendarStart = startOfWeek(start, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(end, { weekStartsOn: 0 })

  const fullDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  return (
    <div className="flex-1 w-full bg-slate-50/50">
      <Card className="shadow-sm rounded-xl border-slate-200 overflow-hidden mb-6">
        <CardHeader className="bg-white border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
          <CardTitle className="text-xl font-bold text-slate-600 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            My Shift Schedule
          </CardTitle>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                title="Calendar View"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 border border-slate-300 rounded-full p-1 bg-white">
              <button onClick={handlePrevMonth} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-red-600 min-w-[110px] text-center text-sm">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 bg-white">
          {viewMode === "calendar" ? (
            <div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2 hidden sm:block">
                    {day}
                  </div>
                ))}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2 sm:hidden">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-slate-200/50 border border-slate-200 rounded-lg hidden sm:block"></div>
                ))}
                {fullDays.map(day => {
                  const dateStr = format(day, "yyyy-MM-dd")
                  const shiftForDay = assignments.find(a => format(new Date(a.date), "yyyy-MM-dd") === dateStr)

                  const isTodayDate = isToday(day)

                  let containerClass = "min-h-[90px] sm:min-h-[120px] p-2 sm:p-3 rounded-lg border transition-all flex flex-col gap-1 relative group "

                  if (isTodayDate) {
                    containerClass += "bg-blue-50/30 border-blue-400 shadow-sm"
                  } else if (shiftForDay) {
                    containerClass += "bg-slate-50/30 border-slate-400 shadow-sm"
                  } else {
                    containerClass += "bg-slate-50 border-slate-300 hover:border-slate-300"
                  }

                  return (
                    <TooltipProvider key={day.toString()}>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <div className={containerClass}>
                            <div className="flex justify-between items-start">
                              <span className={`text-sm font-medium ${isTodayDate ? 'text-blue-700' : shiftForDay ? 'text-slate-700' : 'text-slate-400'}`}>
                                {format(day, "d")}
                              </span>
                              {isTodayDate && (
                                <span className="hidden sm:inline-block text-[9px] font-bold uppercase text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                  Today
                                </span>
                              )}
                            </div>

                            {shiftForDay ? (
                              <div className={`mt-auto border rounded p-1.5 sm:p-2 flex flex-col items-center justify-center text-center ${getShiftStyle(shiftForDay.shift?.type)}`}>
                                <span className="font-semibold text-xs sm:text-sm truncate w-full">{shiftForDay.shift?.type || 'OFF'}</span>
                                {shiftForDay.shift?.type !== 'OFF' && (
                                  <span className="text-[10px] sm:text-xs opacity-80 mt-0.5 hidden sm:inline-block truncate w-full">
                                    {formatTime(shiftForDay.shift.startTime)} - {formatTime(shiftForDay.shift.endTime)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="mt-auto text-xs text-slate-400 text-center"></div>
                            )}
                          </div>
                        </TooltipTrigger>
                        {shiftForDay?.shift && shiftForDay.shift.type !== 'OFF' && (
                          <TooltipContent className="bg-slate-800 text-white border-none p-3 shadow-lg">
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold text-sm">{shiftForDay.shift.name}</p>
                              <p className="text-xs text-slate-300 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(shiftForDay.shift.startTime)} - {formatTime(shiftForDay.shift.endTime)}
                              </p>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Shift Name</th>
                    <th className="px-4 py-3">Start Time</th>
                    <th className="px-4 py-3">End Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">
                        No shifts assigned for this month.
                      </td>
                    </tr>
                  ) : (
                    assignments.map(a => {
                      const isTodayDate = isToday(new Date(a.date))
                      return (
                        <tr key={a.id} className={`hover:bg-slate-50 ${isTodayDate ? 'bg-blue-50/20' : ''}`}>
                          <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                            {format(new Date(a.date), "dd MMM yyyy")}
                            {isTodayDate && <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50 uppercase">Today</Badge>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getShiftStyle(a.shift?.type)}`}>
                              {a.shift?.name || 'OFF'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {a.shift?.type !== 'OFF' ? formatTime(a.shift?.startTime) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {a.shift?.type !== 'OFF' ? formatTime(a.shift?.endTime) : '-'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
