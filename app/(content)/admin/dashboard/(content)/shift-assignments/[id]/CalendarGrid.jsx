"use client"

import { format, isToday } from "date-fns"
import { Plus, CheckCircle2 } from "lucide-react"
import { getShiftStyle } from "@/_components/_constants/shiftConstants"
import { formatTime } from "@/_functions/globalFunction"

export default function CalendarGrid({ 
  daysInMonth, 
  emptyDays, 
  assignments, 
  onDayClick,
  isSelectMode,
  selectedDates = []
}) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <>
      <div className="grid grid-cols-7 gap-2 mb-4 bg-slate-100 rounded-md">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-slate-500 py-2 hidden sm:block">
            {day}
          </div>
        ))}
        {dayNamesShort.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2 sm:hidden">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-slate-300/30 rounded-lg hidden sm:block"></div>
        ))}
        
        {daysInMonth.map(day => {
          const dateStr = format(day, "yyyy-MM-dd")
          const isSelected = selectedDates.includes(dateStr)
          const shiftAssignmentForDay = assignments.find(a => a?.date && format(new Date(a.date), "yyyy-MM-dd") === dateStr)

          const shiftData = shiftAssignmentForDay?.shift
          const isTodayDate = isToday(day)
          const hasShift = !!shiftData
          const shiftType = shiftData?.type || 'OFF'

          let containerClass = "min-h-[90px] sm:min-h-[120px] p-2 sm:p-3 rounded-lg border transition-all flex flex-col gap-1 relative cursor-pointer hover:-translate-y-0.5 group "

          if (isSelectMode && isSelected) {
            containerClass += "bg-blue-600 border-blue-700 ring-2 ring-blue-300 shadow-md transform scale-[1.02] z-10"
          } else if (isTodayDate) {
            containerClass += "bg-blue-50/20 border-blue-400"
          } else if (hasShift) {
            containerClass += "bg-white border-slate-400"
          } else {
            containerClass += "bg-slate-50 border-slate-300 border-dashed hover:border-blue-500 hover:bg-blue-50"
          }

          const textColorClass = (isSelectMode && isSelected) ? "text-white" : (isTodayDate ? 'text-blue-700' : 'text-slate-600')

          return (
            <div key={day.toString()} className={containerClass} onClick={() => onDayClick(day)}>
              <div className="flex justify-between items-start">
                <span className={`text-sm font-bold ${textColorClass}`}>
                  {format(day, "d")}
                </span>
                
                {isSelectMode && isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-white fill-blue-500" />
                )}

                {isTodayDate && !isSelected && (
                  <span className="hidden sm:inline-block text-[9px] font-bold uppercase text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                    Today
                  </span>
                )}
              </div>

              {hasShift ? (
                <div className={`mt-auto border rounded p-1.5 sm:p-2 flex flex-col items-center justify-center text-center ${isSelected && isSelectMode ? 'bg-white/20 border-white/40 text-white' : getShiftStyle(shiftType)}`}>
                  <span className="font-semibold text-xs sm:text-sm truncate w-full">
                    {shiftType}
                  </span>
                  {shiftType !== 'OFF' && (
                    <span className="text-[10px] sm:text-xs opacity-80 mt-0.5 hidden sm:inline-block truncate w-full">
                      {formatTime(shiftData?.startTime)} - {formatTime(shiftData?.endTime)}
                    </span>
                  )}
                </div>
              ) : (
                <div className={`mt-auto text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 ${isSelected && isSelectMode ? 'text-white' : 'text-green-600'}`}>
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
