"use client"

import React from "react"
import { CheckCircle2, Plus } from "lucide-react"
import { formatJakarta, parseJakarta, getNowJakarta } from "@/_lib/time"
import { getShiftStyle } from "@/_components/_constants/shiftConstants"
import { formatTime } from "@/_functions/globalFunction"

const CalendarCell = ({ day, isSelected, assignment, previewShift, isSelectMode, onInteraction, onMouseEnter }) => {
  const isTodayDate = parseJakarta(day).isSame(getNowJakarta(), 'day')

  const shiftData = assignment?.shift
  const hasShift = !!shiftData
  const isPreview = !!previewShift
  const shiftType = isPreview ? previewShift.type : (shiftData?.type || 'OFF')

  let containerClass = "min-h-[100px] sm:min-h-[130px] p-3 rounded-lg border transition-all flex flex-col gap-1 relative cursor-pointer group "

  if (isSelectMode && isSelected) { containerClass += "border-green-500 ring ring-green-100 shadow-sm transform scale-[1.02] z-10 " }
  else if (isSelected && hasShift) { containerClass += "border-red-500 ring ring-red-100 shadow-sm transform scale-[1.02] z-10 " }
  else if (hasShift) { containerClass += "bg-white border-slate-400 hover:border-slate-300 hover:shadow-sm " }
  else if (isTodayDate) { containerClass += "bg-blue-50/30 border-blue-200 shadow-xs " }
  else { containerClass += "bg-white border-slate-300 hover:border-blue-300 hover:bg-blue-50/30 " }

  if (isPreview) { containerClass += "ring-2 ring-blue-400 ring-offset-2 z-20 " }

  return (
    <div className={containerClass} onPointerDown={onInteraction} onMouseEnter={onMouseEnter}>
      <div className="flex justify-between items-start">
        <span className={`text-sm font-semibold ${isSelected && isSelectMode ? 'text-green-700' : (isTodayDate ? 'text-blue-600' : 'text-slate-400')}`}>
          {formatJakarta(day, "D")}
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

      {(hasShift || isPreview) ? (
        <div className={`mt-auto border rounded-md p-2 flex flex-col items-center justify-center text-center shadow-xs transition-opacity ${isPreview ? 'opacity-70 animate-pulse border-blue-400' : ''} ${getShiftStyle(shiftType)}`}>
          <span className="font-bold text-sm sm:text-xs truncate w-full uppercase tracking-tight">
            {shiftType}
          </span>
          {shiftType !== 'OFF' && (
            <span className="text-[10px] font-semibold opacity-70 mt-0.5 hidden sm:inline-block truncate w-full">
              {formatTime(isPreview ? previewShift.startTime : shiftData?.startTime)} - {formatTime(isPreview ? previewShift.endTime : shiftData?.endTime)}
            </span>
          )}
          {isPreview && (
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">PREVIEW</div>
          )}
        </div>
      ) : (
        <div className={`mt-auto text-[10px] font-semibold uppercase tracking-wide text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 py-2 rounded-md bg-slate-50 border border-slate-100 ${isSelected && isSelectMode ? 'text-red-500 bg-red-50/50 border-red-100' : 'text-slate-400'}`}>
          {isSelectMode ? (isSelected ? 'Deselect' : 'Select') : (
            <><Plus className="w-3 h-3" /> Assign</>
          )}
        </div>
      )}
    </div>
  )
}

// Optimization: Prevents re-render if props haven't changed
export default React.memo(CalendarCell, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.isSelectMode === next.isSelectMode &&
    prev.assignment === next.assignment &&
    prev.previewShift === next.previewShift &&
    prev.day.toString() === next.day.toString()
  )
})
