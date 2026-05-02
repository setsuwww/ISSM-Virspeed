"use client"

import { useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isPast, isToday, isTomorrow, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, AlertCircle, FileText, RefreshCcw, Calendar as CalendarIcon, Info, ChevronDown, LogIn, LogOut } from "lucide-react"
import { Card, CardContent, CardTitle } from "@/_components/ui/Card"
import { Badge } from "@/_components/ui/Badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/Tooltip"
import { getShiftStyle } from "@/_components/_constants/shiftConstants"

const CollapsibleSection = ({ title, icon, colorClass, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`bg-white border border-slate-200 rounded-xl px-4 py-1 shadow-sm overflow-hidden transition-all ${isOpen ? colorClass : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2 font-medium text-slate-800">
          {icon}
          {title}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 pt-1 animate-in slide-in-from-top-2 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

export default function Calendar({
  calendarMap,
  todayActivity,
  historyData
}) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calendar Logic (Minimal on client)
  const start = startOfMonth(currentDate)
  const end = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start, end })
  const emptyDays = Array(start.getDay()).fill(null)

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Shift Calendar Section */}
      <div className="lg:w-2/3 flex flex-col gap-4">
        <Card className="shadow-sm rounded-xl border-slate-200 overflow-hidden !p-0">
          <div className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between p-4">
            <CardTitle className="ml-2 text-lg font-semibold text-slate-800 flex items-center gap-2">
              Shift Calendar
            </CardTitle>
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-full shadow-xs">
              <button onClick={handlePrevMonth} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium text-sm text-red-600 min-w-[100px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button onClick={handleNextMonth} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <CardContent className="!p-0">
            <div className="grid grid-cols-7 gap-1 mb-2 bg-slate-100 rounded-md mx-4">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 p-4">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] p-2 bg-slate-200/60 rounded-lg"></div>
              ))}
              {daysInMonth.map(day => {
                const dateStr = format(day, "yyyy-MM-dd")
                const shiftForDay = calendarMap[dateStr] // 🔥 O(1) Lookup

                const isTodayDate = isToday(day)

                const hasShift = !!shiftForDay

                let containerClass = `min-h-[80px] sm:min-h-[100px] p-2 rounded-lg border transition-all flex flex-col gap-1 relative group`

                if (isTodayDate) {
                  containerClass += " bg-blue-50 border-blue-400"
                }
                else if (hasShift) {
                  containerClass += " bg-white border-slate-300 hover:border-slate-400"
                }
                else {
                  containerClass += " bg-slate-100/60 border-slate-300 border-dashed"
                }

                return (
                  <TooltipProvider key={dateStr}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className={containerClass}>
                          <div className="flex justify-between items-start">
                            <span className={`text-xs font-medium ${isTodayDate ? 'text-blue-700' : 'text-slate-600'}`}>
                              {format(day, "d")}
                            </span>
                            {isTodayDate && (
                              <span className="text-[9px] font-bold uppercase text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                Today
                              </span>
                            )}
                          </div>

                          {shiftForDay ? (
                            <div className={`mt-auto text-xs border rounded p-1 flex flex-col items-center justify-center text-center ${getShiftStyle(shiftForDay.shift?.type)}`}>
                              <span className="font-semibold">{shiftForDay.shift?.type || 'OFF'}</span>
                            </div>
                          ) : (
                            <div className="mt-auto text-[10px] text-slate-400 text-center">-</div>
                          )}
                        </div>
                      </TooltipTrigger>
                      {shiftForDay?.shift && shiftForDay.shift.type !== 'OFF' && (
                        <TooltipContent className="bg-slate-800 text-white border-none p-3 shadow-lg">
                          <div className="flex flex-col gap-1">
                            <p className="font-semibold text-sm">{shiftForDay.shift.name}</p>
                            <p className="text-xs text-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {shiftForDay.startTimeStr} - {shiftForDay.endTimeStr}
                            </p>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:w-1/3 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-1">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Activity
            <span className="text-xs font-normal text-slate-400 ml-auto bg-slate-100 px-2 py-1 rounded-full">Today</span>
          </h3>

          <Card className="shadow-sm rounded-xl border-slate-200 overflow-hidden bg-white">
            <CardContent className="p-4">
              {todayActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <div className="bg-slate-50 p-3 rounded-full mb-2">
                    <Clock className="w-6 h-6 opacity-20" />
                  </div>
                  <p className="text-sm italic">No activity today</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  {todayActivity.map((activity, idx) => {
                    let icon = <Clock className="w-3 h-3" />
                    let iconBg = "bg-slate-100 text-slate-500"

                    if (activity.type === "LOGIN") {
                      icon = <LogIn className="w-3 h-3" />
                      iconBg = "bg-blue-100 text-blue-600"
                    } else if (activity.type === "LOGOUT") {
                      icon = <LogOut className="w-3 h-3" />
                      iconBg = "bg-red-100 text-red-600"
                    } else if (activity.type === "CHECK_IN") {
                      icon = <LogIn className="w-3 h-3" />
                      iconBg = "bg-green-100 text-green-600"
                    } else if (activity.type === "CHECK_OUT") {
                      icon = <LogOut className="w-3 h-3" />
                      iconBg = "bg-orange-100 text-orange-600"
                    } else if (activity.type === "EARLY_CHECKOUT_REQUEST") {
                      icon = <AlertCircle className="w-3 h-3" />
                      iconBg = "bg-red-100 text-red-600"
                    } else if (activity.type === "LEAVE_REQUEST") {
                      icon = <CalendarIcon className="w-3 h-3" />
                      iconBg = "bg-purple-100 text-purple-600"
                    } else if (activity.type === "PERMISSION_REQUEST") {
                      icon = <Info className="w-3 h-3" />
                      iconBg = "bg-amber-100 text-amber-600"
                    } else if (activity.type === "SHIFT_CHANGE_REQUEST") {
                      icon = <RefreshCcw className="w-3 h-3" />
                      iconBg = "bg-indigo-100 text-indigo-600"
                    }

                    return (
                      <div key={idx} className="relative group">
                        <div className={`absolute -left-[25px] top-0 w-5 h-5 rounded-full flex items-center justify-center border-4 border-white z-10 transition-transform group-hover:scale-110 shadow-sm ${iconBg}`}>
                          {icon}
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 tabular-nums">{activity.time}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                            <span className="text-sm font-semibold text-slate-700">{activity.label}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-1">
            <FileText className="w-5 h-5 text-slate-500" />
            History
          </h3>

          <div className="w-full space-y-2 pb-6">
            <CollapsibleSection
              title="Attendance History"
              icon={<Clock className="w-4 h-4 text-blue-500" />}
              colorClass="border-blue-100 bg-blue-50/10"
            >
              {historyData.attendance.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-2">No past records</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {historyData.attendance.map(att => (
                    <div key={att.id} className="flex justify-between items-center text-sm p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{att.dateStr}</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          {att.checkInStr} <span className="text-slate-300">→</span> {att.checkOutStr}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider py-0 px-1.5">
                        {att.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  )
}
