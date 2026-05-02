"use client"

import { format } from "date-fns"
import { ChevronLeft, ChevronRight, CalendarPlus, Trash2, CheckSquare, Square } from "lucide-react"
import { Button } from "@/_components/ui/Button"

export default function CalendarHeader({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  onBulkAssign,
  isSelectMode,
  toggleSelectMode,
  selectedCount,
  onBulkDelete,
  onDeleteAll,
  onSelectAll
}) {
  return (
    <div className="bg-slate-50 border-b border-slate-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 py-4 px-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-slate-300 shadow-xs rounded-full p-1">
          <button 
            onClick={onPrevMonth} 
            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-red-600 min-w-[100px] text-center text-sm">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <button 
            onClick={onNextMonth} 
            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-300 hidden sm:block mx-1"></div>

        <Button
          variant={isSelectMode ? "primary" : "outline"}
          size="sm"
          onClick={toggleSelectMode}
          className="gap-2"
        >
          {isSelectMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          {isSelectMode ? "Selection Active" : "Select Mode"}
        </Button>

        {isSelectMode && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="bg-white"
            >
              Select All
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              disabled={selectedCount === 0}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedCount})
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
        <Button
          onClick={onDeleteAll}
          variant="outline"
          size="sm"
          className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 bg-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete All
        </Button>

        <Button
          onClick={onBulkAssign}
          variant="primary"
          size="sm"
          className="flex items-center gap-2"
        >
          <CalendarPlus className="w-4 h-4" />
          Bulk Rotation
        </Button>
      </div>
    </div>
  )
}
