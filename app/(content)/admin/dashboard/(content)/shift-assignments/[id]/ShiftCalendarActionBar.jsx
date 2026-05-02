"use client"

import { format } from "date-fns"
import { ChevronLeft, ChevronRight, CalendarPlus, Trash2, CheckSquare, Square, Zap, SquarePlus, SquarePen } from "lucide-react"
import { Button } from "@/_components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"

export default function ShiftCalendarActionBar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  isSelectMode,
  toggleSelectMode,
  filledCount,
  emptyCount,
  onBulkDelete,
  onBulkEdit,
  onBulkAssign,
  onDeleteAll,
  onSelectAll,

  // Preset props
  presetMode,
  setPresetMode,
  presetShiftId,
  setPresetShiftId,
  onApplyPreset,
  availableShifts,
  loading
}) {
  return (
    <div className="bg-slate-100 p-4 space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-400/70 rounded-full p-1">
            <button
              onClick={onPrevMonth}
              className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-red-600 min-w-[120px] text-center text-sm">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button
              onClick={onNextMonth}
              className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onDeleteAll}
            variant="outline"
            size="sm"
            className="text-red-600 border-slate-300 hover:text-red-700 bg-white h-9 rounded-md"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="h-9 gap-2 rounded-md"
            onClick={() => { }} // Placeholder for existing bulk rotation modal
          >
            <CalendarPlus className="w-4 h-4" />
            Rotation Pattern
          </Button>
        </div>
      </div>

      <hr className="border-slate-400" />

      {/* Bottom Row: Selection and Presets (Inline) */}
      <div className="bg-white py-2 px-4 flex flex-wrap items-center gap-4 rounded-lg">
        {/* Selection Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isSelectMode ? "default" : "outline"}
            size="sm"
            onClick={toggleSelectMode}
            className="gap-2 h-9 rounded-md"
          >
            {isSelectMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {isSelectMode ? "Selection Active" : "Select Mode"}
          </Button>

          {isSelectMode && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-9 text-slate-600 hover:bg-slate-100">
                Select All
              </Button>

              <div className="h-7 w-px bg-slate-300 mx-1"></div>

              <Button
                variant="outline"
                size="sm"
                onClick={onBulkEdit}
                disabled={filledCount === 0 || loading}
                className={`h-9 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 ${filledCount === 0 ? "" : "bg-slate-50 text-amber-600 hover:text-amber-800"}`}
              >
                <SquarePen className="w-4 h-4" />
                Edit ({filledCount})
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onBulkAssign}
                disabled={emptyCount === 0 || loading}
                className={`h-9 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 ${emptyCount === 0 ? "" : "bg-slate-50 text-blue-600 hover:text-blue-800"}`}
              >
                <SquarePlus className="w-4 h-4" />
                Assign ({emptyCount})
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                disabled={filledCount === 0 || loading}
                className="h-9 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden lg:block mx-2"></div>

        {/* Preset Controls */}
        <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1.5 px-2">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Presets</span>
          </div>

          <div className="flex items-center bg-white border border-slate-300 rounded-md p-1">
            <button
              onClick={() => setPresetMode("WEEK")}
              className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all ${presetMode === "WEEK" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                }`}
            >
              Week
            </button>
            <button
              onClick={() => setPresetMode("MONTH")}
              className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all ${presetMode === "MONTH" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                }`}
            >
              Month
            </button>
          </div>

          <Select value={presetShiftId} onValueChange={setPresetShiftId}>
            <SelectTrigger className="w-[160px] !h-8 text-xs bg-white rounded-md">
              <SelectValue placeholder="Shift Assignments ..." />
            </SelectTrigger>
            <SelectContent>
              {availableShifts.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApplyPreset('assign')}
              disabled={!presetShiftId || loading}
              className="h-8 text-xs font-semibold bg-white border-slate-200 text-blue-600"
            >
              Assign
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApplyPreset('edit')}
              disabled={!presetShiftId || loading}
              className="h-8 text-xs font-semibold bg-white border-slate-200 text-amber-600"
            >
              Override
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
