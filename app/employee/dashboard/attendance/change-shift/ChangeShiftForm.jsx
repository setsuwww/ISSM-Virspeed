"use client"

import { useState } from "react"
import { Button } from "@/_components/ui/Button"
import { Label } from "@/_components/ui/Label"
import { Textarea } from "@/_components/ui/Textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/_components/ui/Select"
import { CalendarDays, CircleUserRound, Loader } from "lucide-react"
import { toast } from "sonner"
import { apiFetchData } from "@/_lib/fetch"
import ContentForm from '@/_components/common/ContentForm';
import { ContentInformation } from '@/_components/common/ContentInformation';
import { shiftStyles } from "@/_constants/shiftConstants"

// Konversi tanggal ke ISO lokal tanpa geser timezone (hindari bug UTC -7 jam)
function toLocalISOString(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr + "T00:00:00")
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString()
}

// Format YYYY-MM-DD
function toDateOnlyIso(s) {
  if (!s) return null
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function ChangeShiftForm({ employees = [] }) {
  const todayIso = toDateOnlyIso(new Date())

  const [selectedUser, setSelectedUser] = useState("")
  const [startDate, setStartDate] = useState(todayIso)
  const [endDate, setEndDate] = useState(todayIso)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const startDateObj = new Date(startDate + "T00:00:00")
  const endDateObj = new Date(endDate + "T00:00:00")
  const todayObj = new Date(todayIso + "T00:00:00")

  const startValid = startDateObj >= todayObj
  const endValid = !startDateObj || endDateObj >= startDateObj

  const disabled = loading || !selectedUser || !reason.trim() || !startValid || !endValid

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!startValid) return toast.error("Start date must be today or later.")
    if (!endValid) return toast.error("End date must be same or after start date.")

    const target = employees.find((emp) => String(emp.id) === selectedUser)
    if (!target?.shiftId) return toast.error("Selected user has no shift assigned.")

    setLoading(true)
    try {
      const payload = {
        targetUserId: Number(target.id),
        newShiftId: target.shiftId,
        startDate: toLocalISOString(startDate),   // ✅ FIXED
        endDate: endDate ? toLocalISOString(endDate) : null,  // ✅ FIXED
        reason: reason.trim(),
      }

      await apiFetchData({
        url: "/shifts/user-side-change",
        method: "post",
        data: payload,
        successMessage: "Shift change request submitted successfully.",
        errorMessage: "Failed to submit shift change request.",
      })

      setSelectedUser("")
      setStartDate(todayIso)
      setEndDate(todayIso)
      setReason("")
    } catch (err) {
      console.error("Submit error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ContentForm>
      <ContentForm.Header>
        <ContentInformation
          heading="Change shift form"
          subheading="Send a change shift request to another employee"
        />
      </ContentForm.Header>

      <ContentForm.Body>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-xl border border-slate-200"
        >
          <div className="space-y-2">
            <Label>Select Employee</Label>
            <Select
              value={String(selectedUser)}
              onValueChange={(v) => setSelectedUser(String(v))}
              disabled={loading}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue>
                  {selectedUser ? (
                    (() => {
                      const emp = employees.find((e) => String(e.id) === String(selectedUser))
                      if (!emp) return "Choose an employee"
                      return (
                        <div className="flex items-center text-left space-x-2">
                          <span className="text-xs font-medium text-white bg-slate-600 px-2 py-0.5 rounded-sm">
                            {emp.name}
                          </span>
                          <span className={`${shiftStyles[emp.shift.type]} text-xs px-2 rounded-sm border`}>
                            {emp.email}
                          </span>
                        </div>
                      )
                    })()
                  ) : (
                    "Choose an employee"
                  )}
                </SelectValue>
              </SelectTrigger>

              <div className="text-xs text-slate-400">
                Select the employee whose shift you want to change.
              </div>

              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={String(emp.id)}>
                    <div className="flex items-center space-x-2">
                      <div className="bg-slate-200 text-slate-600 p-2 rounded-full">
                        <CircleUserRound strokeWidth={1} />
                      </div>
                      <div className="flex flex-col p-1">
                        <span className="text-xs text-slate-600">
                          {emp.name} - {emp.shift?.name || "No Shift"}
                        </span>
                        <span className="text-xs text-slate-400">{emp.email}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="flex items-center gap-2">
                <CalendarDays className="text-slate-400" />
                <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 text-sm"
                  value={startDate} onChange={(e) => setStartDate(e.target.value)} min={todayIso}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date (optional)</Label>
              <div className="flex items-center gap-2">
                <CalendarDays className="text-slate-400" />
                <input value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || todayIso}
                  type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason for Change</Label>
            <Textarea className="bg-white" placeholder="Explain why this shift change is needed..."
              value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={disabled}>
            {loading && <Loader className="animate-spin mr-2 h-4 w-4" />}
            Submit Request
          </Button>
        </form>
      </ContentForm.Body>
    </ContentForm>
  )
}
