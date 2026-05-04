"use client"

import React, { useMemo } from "react"
import { format } from "date-fns"
import { CheckSquare, Square, Zap, Loader2 } from "lucide-react"
import { Button } from "@/_components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"
import CalendarNavigationAction from "../_components/CalendarNavigationAction"
import AssignEditDelete from "../_components/AssignEditDelete"

export default function ShiftCalendarActionBar({
  currentDate, onPrevMonth, onNextMonth,
  isSelectMode, toggleSelectMode,
  filledCount, emptyCount,
  onBulkDelete, onBulkEdit, onBulkAssign, onDeleteAll, onSelectAll,

  presetType, setPresetType,
  startShiftId, setStartShiftId,
  rotationIndex, setRotationIndex,
  rotationOptions,
  onApplyPreset,
  onHoverPreset,
  availableShifts,
  loading
}) {
  const formattedMonth = useMemo(() => format(currentDate, "MMMM yyyy"), [currentDate])

  return (
    <div className="bg-slate-100 p-4 space-y-4">
      <CalendarNavigationAction
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        formattedMonth={formattedMonth}
        onDeleteAll={onDeleteAll}
      />

      <hr className="border-slate-400" />

      <div className="bg-white py-2 px-4 flex flex-wrap items-center gap-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <Button variant={isSelectMode ? "default" : "outline"} size="sm" onClick={toggleSelectMode}
            className="gap-2 h-9 rounded-md"
          >
            {isSelectMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {isSelectMode ? "Selection Active" : "Select Mode"}
          </Button>

          {isSelectMode && (
            <AssignEditDelete
              isSelectMode={isSelectMode}
              onSelectAll={onSelectAll}
              onBulkEdit={onBulkEdit}
              onBulkAssign={onBulkAssign}
              onBulkDelete={onBulkDelete}
              filledCount={filledCount}
              emptyCount={emptyCount}
              loading={loading}
            />
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden lg:block mx-2"></div>

        <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1.5 px-2">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black text-slate-500 tracking-tighter">Presets</span>
          </div>

          {/* 1. Initializing Shift */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-slate-400 ml-1">1. From</span>
            <Select value={startShiftId} onValueChange={setStartShiftId}>
              <SelectTrigger className="w-[150px] !h-8 text-xs bg-white rounded-md border-slate-300">
                <SelectValue placeholder="Shift..." />
              </SelectTrigger>
              <SelectContent>
                {availableShifts.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Pattern */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-slate-400 ml-1">2. Pattern</span>
            <div className="flex items-center bg-white border border-slate-300 rounded-md p-0.5 h-8">
              {[{ id: 'SAME', label: 'SAME' }, { id: 'BY_TURNS', label: 'BY TURNS' }].map(type => (
                <button key={type.id} onClick={() => setPresetType(type.id)}
                  className={`px-3 py-1 text-[9px] font-black rounded-sm transition-all h-full whitespace-nowrap ${presetType === type.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Rotation Pattern */}
          {presetType === "BY_TURNS" && rotationOptions.length > 0 && (
            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
              <span className="text-[10px] font-semibold text-slate-400 ml-1">3. Rotation Pattern</span>
              <div className="flex items-center bg-white border border-slate-300 rounded-md p-0.5 h-8">
                {rotationOptions.map((v, i) => {
                  const label = v.map(id => {
                    const s = availableShifts.find(sh => String(sh.id) === String(id))
                    return s?.type?.[0] || '?'
                  }).join('-')

                  return (
                    <button key={i} onClick={() => setRotationIndex(i)} className={`px-2 py-1 text-[9px] font-black rounded-sm transition-all h-full ${rotationIndex === i ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 self-end mb-0.5 ml-2">
            <Button variant="primary" size="sm" onMouseEnter={() => onHoverPreset(true)} onMouseLeave={() => onHoverPreset(false)} onClick={onApplyPreset} disabled={!startShiftId || loading}
              className="h-8 text-[10px] font-black px-4 rounded-md shadow-blue-100 shadow-lg hover:shadow-xl transition-all uppercase tracking-widest"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Zap className="w-3 h-3 mr-2" />}
              Apply Preset
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
