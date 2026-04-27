"use client"

import { useState, useEffect } from "react"
import { format, addMonths } from "date-fns"
import { WarningCircle } from "phosphor-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"

import { Input } from "@/_components/ui/Input"
import { Label } from "@/_components/ui/Label"
import { Button } from "@/_components/ui/Button"

import { LEAVE_RULES } from "@/_components/_constants/static/leaveIndonesianRule"
import { addWorkDays } from "@/_functions/helpers/attendanceHelpers"

export function LeaveModal({ open, onOpenChange, onSubmit }) {
  const [type, setType] = useState("")
  const [reason, setReason] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [maxEndDate, setMaxEndDate] = useState("")

  useEffect(() => {
    if (!type || !startDate) {
      setMaxEndDate("")
      setEndDate("")
      return
    }

    const rule = LEAVE_RULES[type]
    if (!rule) return

    const start = new Date(`${startDate}T12:00:00`)
    let calculatedEnd = null

    if (rule.maxWorkDays) {
      calculatedEnd = addWorkDays(start, rule.maxWorkDays - 1)
    } else if (rule.months) {
      calculatedEnd = addMonths(start, rule.months)
    }

    if (calculatedEnd instanceof Date && !isNaN(calculatedEnd)) {
      setMaxEndDate(format(calculatedEnd, "yyyy-MM-dd"))
    } else {
      setMaxEndDate("")
    }
  }, [type, startDate])

  const handleSubmit = () => {
    if (!type || !startDate || !endDate) return

    onSubmit({
      type,
      startDate,
      endDate,
      reason: reason?.trim() || null,
    })

    setType("")
    setReason("")
    setStartDate("")
    setEndDate("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" variant="violet">
        <DialogHeader>
          <DialogTitle>Leave Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label>
              Leave Type <span className="text-red-500">*</span>
            </Label>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose leave type" />
              </SelectTrigger>

              <SelectContent>
                {Object.entries(LEAVE_RULES).map(([key, rule]) => (
                  <SelectItem key={key} value={key}>
                    {rule.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {type && (
              <p className="text-xs text-slate-400">
                {LEAVE_RULES[type].description}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>
              Start Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!type}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>
              End Date <span className="text-red-500">*</span>
            </Label>

            <Input
              type="date"
              value={endDate}
              min={startDate}
              max={maxEndDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!startDate}
            />

            {maxEndDate && (
              <p className="flex items-center gap-1 text-[11px] text-blue-500">
                <WarningCircle size={14} />
                Maximum end date depends on valid balance
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional reason"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!type || !startDate || !endDate}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
