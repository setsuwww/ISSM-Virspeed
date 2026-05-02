"use client"

import { format, isToday } from "date-fns"
import { Plus, CheckCircle2 } from "lucide-react"
import { getShiftStyle } from "@/_components/_constants/shiftConstants"
import { formatTime } from "@/_functions/globalFunction"

export default function CalendarGrid({
  daysInMonth,
  emptyDays,
  assignmentMap,
  onDayClick,
  isSelectMode,
  selectedDates = []
}) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <>
      <div className="grid grid-cols-7 gap-2 mb-4 bg-slate-100 rounded-md p-1 border border-slate-100">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2 hidden sm:block">
            {day}
          </div>
        ))}
        {dayNamesShort.map(day => (
          <div key={day} className="text-center text-[10px] font-semibold text-slate-400 py-2 sm:hidden">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-slate-200/60 rounded-2xl hidden sm:block border border-dashed border-slate-100"></div>
        ))}

        {daysInMonth.map(day => {
          const dateStr = format(day, "yyyy-MM-dd")
          const isSelected = selectedDates.includes(dateStr)
          const shiftAssignmentForDay = assignmentMap[dateStr]

          const shiftData = shiftAssignmentForDay?.shift
          const isTodayDate = isToday(day)
          const hasShift = !!shiftData
          const shiftType = shiftData?.type || 'OFF'

          let containerClass = "min-h-[100px] sm:min-h-[130px] p-3 rounded-lg border transition-all flex flex-col gap-1 relative cursor-pointer group "

          if (isSelectMode && isSelected) {
            containerClass += "border-green-500 ring ring-green-100 shadow-sm transform scale-[1.02] z-10"
          } else if (isSelected && hasShift) {
            containerClass += "border-red-500 ring ring-red-100 shadow-sm transform scale-[1.02] z-10"
          } else if (hasShift) {
            containerClass += "bg-white border-slate-400 hover:border-slate-300 hover:shadow-sm"
          } else if (isTodayDate) {
            containerClass += "bg-blue-50/30 border-blue-200 shadow-xs"
          } else {
            containerClass += "bg-white border-slate-300 hover:border-blue-300 hover:bg-blue-50/30"
          }

          return (
            <div key={day.toString()} className={containerClass} onClick={() => onDayClick(day)}>
              <div className="flex justify-between items-start">
                <span className={`text-sm font-semibold ${isSelected && isSelectMode ? 'text-green-700' : (isTodayDate ? 'text-blue-600' : 'text-slate-400')}`}>
                  {format(day, "d")}
                </span>

                {isSelectMode && isSelected && (
                  <div className="bg-green-100 rounded-full p-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                  </div>
                )}

                {isTodayDate && !isSelected && (
                  <span className="text-[10px] font-semibold uppercase text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-lg border border-blue-200">
                    Today
                  </span>
                )}
              </div>

              {hasShift ? (
                <div className={`mt-auto border rounded-md p-2 flex flex-col items-center justify-center text-center shadow-xs ${getShiftStyle(shiftType)}`}>
                  <span className="font-bold text-sm sm:text-xs truncate w-full uppercase tracking-tight">
                    {shiftType}
                  </span>
                  {shiftType !== 'OFF' && (
                    <span className="text-[10px] font-semibold opacity-70 mt-0.5 hidden sm:inline-block truncate w-full">
                      {formatTime(shiftData?.startTime)} - {formatTime(shiftData?.endTime)}
                    </span>
                  )}
                </div>
              ) : (
                <div className={`mt-auto text-[10px] font-black uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 py-2 rounded-md bg-slate-50 border border-slate-100 ${isSelected && isSelectMode ? 'text-red-500 bg-red-50/50 border-red-100' : 'text-slate-400'}`}>
                  {isSelectMode ? (isSelected ? 'Deselect' : 'Select') : (
                    <><Plus className="w-3 h-3" /> Assign</>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
