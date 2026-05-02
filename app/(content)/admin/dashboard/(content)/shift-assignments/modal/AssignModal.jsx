"use client"

import { useState, useEffect } from "react"
import { Plus, LayoutGrid, Zap } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"
import { calculateDuration } from "@/_clients/hooks/admin/useShiftCalendarHooks"
import ShiftModalGrid from "./ShiftModalGrid"

export default function AssignModal({
  isOpen,
  onOpenChange,
  selectedDates,
  availableShifts,
  assignmentMap,
  onConfirm,
  loading
}) {
  const [individualValues, setIndividualValues] = useState({})
  const [bulkShift, setBulkShift] = useState("")
  const duration = calculateDuration(selectedDates)

  // Initialize values when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = {}
      selectedDates.forEach(d => {
        initial[d] = ""
      })
      setIndividualValues(initial)
      setBulkShift("")
    }
  }, [isOpen, selectedDates])

  const handleApplyBulk = (val) => {
    setBulkShift(val)
    const updated = { ...individualValues }
    selectedDates.forEach(d => {
      updated[d] = val
    })
    setIndividualValues(updated)
  }

  const canSubmit = Object.values(individualValues).some(v => !!v)

  if (!duration) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white rounded-2xl" showCloseButton={false} variant="blue">
        <DialogHeader className="px-6 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-600">Bulk Assignment</DialogTitle>
                <DialogDescription className="text-slate-400 text-sm">Assign shifts to {selectedDates.length} empty days.</DialogDescription>
              </div>
            </div>

            <div className="text-right">
              <p className="text-md font-semibold text-slate-600">{duration.formattedRange}</p>
              <p className="text-xs font-semibold text-blue-600">{duration.breakdown}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-600">Quick Apply All to :</span>
            </div>
            <Select value={bulkShift} onValueChange={handleApplyBulk}>
              <SelectTrigger className="w-[200px] h-9 bg-slate-50 border-slate-200 rounded-lg">
                <SelectValue placeholder="Select shift..." />
              </SelectTrigger>
              <SelectContent>
                {availableShifts.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} ({s.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-600">Individual Date Configuration</h3>
          </div>

          <ShiftModalGrid
            dates={selectedDates}
            assignmentMap={assignmentMap}
            availableShifts={availableShifts}
            individualValues={individualValues}
            setIndividualValues={setIndividualValues}
            isEdit={false}
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-white h-10 font-semibold rounded-md"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(individualValues, 'assign')}
            disabled={!canSubmit || loading}
            className="flex-1 h-10 font-semibold rounded-md bg-blue-600 border border-blue-600 text-white hover:bg-radial hover:from-blue-700 hover:border-blue-800"
          >
            {loading ? "Processing..." : `Confirm ${selectedDates.length} Assignments`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
