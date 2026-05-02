"use client"

import { Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"
import { Input } from "@/_components/ui/Input"
import { Label } from "@/_components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"

export default function CalendarBulkCreateModal({
  isOpen,
  onOpenChange,
  bulkStartDate,
  setBulkStartDate,
  bulkEndDate,
  setBulkEndDate,
  bulkPattern,
  setBulkPattern,
  availableShifts,
  hasAvailableShifts,
  onSave
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <DialogTitle className="text-lg">Bulk Shift Assignment</DialogTitle>
          <DialogDescription>Apply a repeating rotation pattern over a date range.</DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1">Start Date</Label>
              <Input
                type="date"
                typeDate={true}
                value={bulkStartDate}
                onChange={(e) => setBulkStartDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1">End Date</Label>
              <Input
                type="date"
                typeDate={true}
                value={bulkEndDate}
                onChange={(e) => setBulkEndDate(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="block text-sm font-medium text-slate-700">Shift Rotation Pattern</Label>
              <Button
                variant="link"
                onClick={() => setBulkPattern([...bulkPattern, ""])}
                className="text-sm text-blue-600 font-medium flex items-center gap-1 !p-0 !h-auto"
              >
                <Plus className="w-3 h-3" /> Add Rotation Day
              </Button>
            </div>
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {bulkPattern.map((patternVal, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-semibold text-slate-400 w-12 uppercase">Day {idx + 1}</span>
                  <Select
                    value={patternVal}
                    onValueChange={(val) => {
                      const newPat = [...bulkPattern]
                      newPat[idx] = val
                      setBulkPattern(newPat)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Choose Shift --" />
                    </SelectTrigger>

                    <SelectContent>
                      {hasAvailableShifts ? (
                        availableShifts.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name} ({s.type})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Tidak ada shift tersedia
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {bulkPattern.length > 1 && (
                    <Button
                      variant="ghost"
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2"
                      onClick={() => setBulkPattern(bulkPattern.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={!hasAvailableShifts}
          >
            Apply Pattern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
