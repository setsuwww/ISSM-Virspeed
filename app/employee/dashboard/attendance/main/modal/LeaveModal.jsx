"use client"

import { useState, useEffect } from "react"
import { format, addMonths } from "date-fns"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"
import { Input } from "@/_components/ui/Input"
import { Label } from "@/_components/ui/Label"
import { Button } from "@/_components/ui/Button"

import { LEAVE_RULES } from "@/_constants/static/leaveIndonesianRule"
import { addWorkDays } from "@/_function/helpers/attendanceHelpers"
import { WarningCircle } from "phosphor-react"

export function LeaveModal({
  open,
  onOpenChange,
  onSubmit,
}) {
  const [type, setType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (!type || !startDate) {
      setEndDate("")
      return
    }

    const rule = LEAVE_RULES[type]
    let calculatedEnd

    if (rule.maxWorkDays) {
      calculatedEnd = addWorkDays(startDate, rule.maxWorkDays)
    }

    if (rule.months) {
      calculatedEnd = addMonths(new Date(startDate), rule.months)
    }

    setEndDate(format(calculatedEnd, "yyyy-MM-dd"))
  }, [type, startDate])

  const handleSubmit = () => {
    if (!type || !startDate || !endDate) return

    onSubmit?.({
      type,
      startDate,
      endDate,
    })

    setType("")
    setStartDate("")
    setEndDate("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" variant="violet">
        <DialogHeader>
          <DialogTitle>Leave</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Leave Type<span className="text-red-500">*</span></Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Leave type" />
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

          <div className="space-y-2 ">
            <Label>Start date<span className="text-red-500">*</span></Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!type}
            />
          </div>

          <div className="space-y-2 ">
            <Label>End date <span className="text-xs font-light text-slate-400">(Auto fill)</span></Label>
            <Input
              type="date"
              value={endDate}
              disabled
              className="bg-slate-100 cursor-not-allowed"
            />
            <p className="flex items-center gap-x-1 text-xs text-blue-500">
              <WarningCircle /> End Date is auto filled based on Leave type & Start Date
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={!type || !startDate || !endDate} className="bg-violet-600 hover:bg-violet-700 text-white">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
