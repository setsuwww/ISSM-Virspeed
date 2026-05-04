"use client"

import React, { useMemo } from "react"
import { formatJakarta } from "@/_lib/time"
import CalendarCell from "./CalendarCell"

/**
 * Modular CalendarGrid component
 */
export default function CalendarGrid({
  daysInMonth,
  emptyDays,
  assignmentMap,
  onDayClick,
  isSelectMode,
  selectedDates = [],

  // Drag Selection
  onDragStart,
  onDragEnter,
  onDragEnd,

  // Preview
  previewMap = null
}) {
  const dayNames = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], [])
  const dayNamesShort = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], [])

  return (
    <div onMouseUp={onDragEnd} className="select-none">
      {/* Header */}
      <div className="grid grid-cols-7 gap-2 mb-4 p-1">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-semibold bg-slate-200 rounded-md text-slate-600 py-2 hidden sm:block">
            {day}
          </div>
        ))}
        {dayNamesShort.map(day => (
          <div key={day} className="text-center text-[10px] font-semibold text-slate-400 py-2 sm:hidden">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, i) => (
          <div 
            key={`empty-${i}`} 
            className="min-h-[100px] p-2 bg-slate-200/60 rounded-2xl hidden sm:block border border-dashed border-slate-100"
          />
        ))}

        {daysInMonth.map(day => {
          const dateStr = formatJakarta(day, "YYYY-MM-DD")
          
          return (
            <CalendarCell
              key={dateStr}
              day={day}
              isSelected={selectedDates.includes(dateStr)}
              assignment={assignmentMap[dateStr]}
              previewShift={previewMap?.[dateStr]}
              isSelectMode={isSelectMode}
              onInteraction={(e) => {
                onDayClick(day, e)
                onDragStart?.(day)
              }}
              onMouseEnter={() => onDragEnter?.(day)}
            />
          )
        })}
      </div>
    </div>
  )
}
