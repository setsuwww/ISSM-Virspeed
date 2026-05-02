"use client"

import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"

export default function CalendarSingleCreateModal({
  isOpen,
  onOpenChange,
  selectedDate,
  existingAssignment,
  formShiftId,
  setFormShiftId,
  availableShifts,
  hasAvailableShifts,
  onSave,
  onDelete
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white" showCloseButton={false}>
        <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">
            {existingAssignment ? 'Edit Assignment' : 'New Assignment'}
          </DialogTitle>
          <div className="text-sm font-medium text-red-600 bg-white px-3 py-1 rounded-md border border-slate-300">
            {selectedDate ? format(selectedDate, "dd MMM yyyy") : ""}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Shift</label>
            <Select
              value={formShiftId}
              onValueChange={setFormShiftId}
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
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex sm:justify-between items-center gap-2">
          {existingAssignment ? (
            <Button
              variant="destructive"
              onClick={onDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          ) : <div className="hidden sm:block"></div>}

          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto bg-white"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onSave}
              className="w-full sm:w-auto"
              disabled={!hasAvailableShifts}
            >
              Save Shift
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
