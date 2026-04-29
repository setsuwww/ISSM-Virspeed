"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isTomorrow, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, AlertCircle, FileText, RefreshCcw, Calendar as CalendarIcon, Info, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/Card"
import { Badge } from "@/_components/ui/Badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/Tooltip"
import { getShiftStyle } from "@/_components/_constants/shiftConstants"

const formatTime = (minutes) => {
  if (minutes == null) return null;
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

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

export default function DashboardClient({

  assignments,
  attendanceHistory,
  earlyCheckouts,
  permissions,
  leaves,
  shiftChanges
}) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const start = startOfMonth(currentDate)
  const end = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start, end })

  // Fill empty days for alignment
  const firstDayOfMonth = start.getDay()
  const emptyDays = Array(firstDayOfMonth).fill(null)

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Shift Calendar Section */}
      <div className="lg:w-2/3 flex flex-col gap-4">
        <Card className="shadow-sm rounded-xl border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-slate-500" />
              My Shift Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium text-slate-700 min-w-[120px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] p-2 bg-slate-50/50 rounded-lg"></div>
              ))}
              {daysInMonth.map(day => {
                const dateStr = format(day, "yyyy-MM-dd")
                const shiftForDay = assignments.find(a => format(new Date(a.date), "yyyy-MM-dd") === dateStr)

                const isTodayDate = isToday(day)
                const isTomorrowDate = isTomorrow(day)

                let containerClass = "min-h-[80px] sm:min-h-[100px] p-2 rounded-lg border transition-all flex flex-col gap-1 relative group "

                if (isTodayDate) {
                  containerClass += "bg-blue-50/30 border-blue-400 shadow-sm"
                } else if (isTomorrowDate) {
                  containerClass += "bg-slate-50/80 border-slate-300"
                } else {
                  containerClass += "bg-white border-slate-100 hover:border-slate-300"
                }

                return (
                  <TooltipProvider key={day.toString()}>
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
          </CardContent>
        </Card>
      </div>

      {/* History Section (Collapsible) */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 px-1">
          <FileText className="w-5 h-5 text-slate-500" />
          Recent Activity
        </h3>

        <div className="w-full space-y-2">
          {/* Attendance History */}
          <CollapsibleSection
            title="Attendance History"
            icon={<Clock className="w-4 h-4 text-blue-500" />}
            colorClass="border-blue-300"
            defaultOpen={true}
          >
            {attendanceHistory.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-2">No recent attendance</p>
            ) : (
              <div className="flex flex-col gap-3">
                {attendanceHistory.map(att => (
                  <div key={att.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{format(new Date(att.date), "dd MMM yyyy")}</span>
                      <span className="text-xs text-slate-500">
                        {att.checkInTime ? format(new Date(att.checkInTime), "HH:mm") : "-"}
                        {' → '}
                        {att.checkOutTime ? format(new Date(att.checkOutTime), "HH:mm") : "-"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase bg-white">
                      {att.status || "-"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Early Checkout */}
          <CollapsibleSection
            title="Early Checkout"
            icon={<AlertCircle className="w-4 h-4 text-orange-500" />}
            colorClass="border-orange-300"
          >
            {earlyCheckouts.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-2">No early checkout requests</p>
            ) : (
              <div className="flex flex-col gap-3">
                {earlyCheckouts.map(req => (
                  <div key={req.id} className="flex flex-col gap-1 text-sm p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">
                        {req.attendance?.date ? format(new Date(req.attendance.date), "dd MMM yyyy") : "-"}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase bg-white">{req.status}</Badge>
                    </div>
                    <span className="text-xs text-slate-500 truncate" title={req.reason}>Reason: {req.reason || "-"}</span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Permission */}
          <CollapsibleSection
            title="Permission"
            icon={<Info className="w-4 h-4 text-purple-500" />}
            colorClass="border-purple-300"
          >
            {permissions.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-2">No permission requests</p>
            ) : (
              <div className="flex flex-col gap-3">
                {permissions.map(req => (
                  <div key={req.id} className="flex flex-col gap-1 text-sm p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">
                        {format(new Date(req.date), "dd MMM yyyy")}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase bg-white">{req.approval || "PENDING"}</Badge>
                    </div>
                    <span className="text-xs text-slate-500 truncate" title={req.reason}>Reason: {req.reason || "-"}</span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Leave */}
          <CollapsibleSection
            title="Leave"
            icon={<CalendarIcon className="w-4 h-4 text-green-500" />}
            colorClass="border-green-300"
          >
            {leaves.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-2">No leave requests</p>
            ) : (
              <div className="flex flex-col gap-3">
                {leaves.map(req => (
                  <div key={req.id} className="flex flex-col gap-1 text-sm p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">
                        {req.leaveType?.name || "-"}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase bg-white">{req.status}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">
                      {format(new Date(req.startDate), "dd MMM")} - {format(new Date(req.endDate), "dd MMM yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Shift Change */}
          <CollapsibleSection
            title="Shift Change"
            icon={<RefreshCcw className="w-4 h-4 text-rose-500" />}
            colorClass="border-rose-300"
          >
            {shiftChanges.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-2">No shift change requests</p>
            ) : (
              <div className="flex flex-col gap-3">
                {shiftChanges.map(req => (
                  <div key={req.id} className="flex flex-col gap-2 text-sm p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">
                        {format(new Date(req.startDate), "dd MMM yyyy")}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase bg-white">{req.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-white p-1.5 rounded border border-slate-100">
                      <div className="text-slate-500">{req.oldShift?.name || "-"}</div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <div className="text-slate-700 font-medium">{req.targetShift?.name || "-"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  )
}
