"use client"

import { useState, useTransition } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/Card"
import { Label } from "@/_components/ui/Label"
import { Button } from "@/_components/ui/Button"
import { toast } from "sonner"
import { Calendar, FilePenLine } from "lucide-react"
import { userSendLeaveRequest } from "@/_server/attendanceAction"

export default function LeaveForm() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => startTransition(async () => {
    if (!startDate || !endDate || !reason.trim()) {
      toast.error("Semua field wajib diisi")
      return
    }

    const result = await userSendLeaveRequest({
      startDate,
      endDate,
      reason
    })

    if (result?.error) toast.error(result.error)
    else {
      toast.success("Leave request sent")
      setStartDate("")
      setEndDate("")
      setReason("")
    }
  })

  return (
    <div className="p-8 space-y-8">
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            Leave Request
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need a leave..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending || !startDate || !endDate || !reason.trim()}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Submit Leave Request
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
