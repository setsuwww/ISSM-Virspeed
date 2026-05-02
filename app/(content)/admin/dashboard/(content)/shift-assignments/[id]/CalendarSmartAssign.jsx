"use client"

import { Zap } from "lucide-react"
import { Button } from "@/_components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"

export default function CalendarSmartAssign({
  presetMode,
  setPresetMode,
  presetShiftId,
  setPresetShiftId,
  availableShifts,
  onApply,
  loading
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-blue-50/50 border-y border-blue-100 mb-4 rounded-lg">
      <div className="flex items-center gap-2 mr-2">
        <Zap className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-900">Smart Assign:</span>
      </div>

      <div className="flex items-center bg-white border border-slate-200 rounded-md p-1 shadow-sm">
        <button
          onClick={() => setPresetMode("WEEK")}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
            presetMode === "WEEK" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setPresetMode("MONTH")}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
            presetMode === "MONTH" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Month
        </button>
      </div>

      <Select value={presetShiftId} onValueChange={setPresetShiftId}>
        <SelectTrigger className="w-[180px] h-9 bg-white">
          <SelectValue placeholder="Select Shift" />
        </SelectTrigger>
        <SelectContent>
          {availableShifts.map(s => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.name} ({s.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="primary"
        size="sm"
        onClick={onApply}
        disabled={!presetShiftId || loading}
        className="h-9 gap-2"
      >
        {loading ? "Applying..." : "Apply Preset"}
      </Button>
    </div>
  )
}
