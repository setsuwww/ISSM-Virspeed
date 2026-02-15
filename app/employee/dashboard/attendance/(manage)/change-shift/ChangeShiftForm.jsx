"use client"

import { useState } from "react"
import { Button } from "@/_components/ui/Button"
import { Label } from "@/_components/ui/Label"
import { Textarea } from "@/_components/ui/Textarea"
import { Popover, PopoverTrigger, PopoverContent } from "@/_components/ui/Popover"
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/_components/ui/Command"
import { Check } from "lucide-react"
import { CalendarDays, Loader } from "lucide-react"
import { toast } from "sonner"
import { apiFetchData } from "@/_lib/fetch"
import ContentForm from '@/_components/common/ContentForm';
import { ContentInformation } from '@/_components/common/ContentInformation';
import { shiftStyles } from "@/_constants/shiftConstants"
import { capitalize } from "@/_functions/globalFunction"

function toLocalISOString(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr + "T00:00:00")
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString()
}

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

  const handleCancel = () => {
    setSelectedUser("")
    setStartDate(todayIso)
    setEndDate(todayIso)
    setReason("")
  }

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
        startDate: toLocalISOString(startDate),
        endDate: endDate ? toLocalISOString(endDate) : null,
        reason: reason.trim(),
      }

      await apiFetchData({
        url: "/shifts/user-side-change", method: "post", data: payload,
        successMessage: "Shift change request submitted successfully.",
        errorMessage: "Failed to submit shift change request.",
      })

      setSelectedUser("")
      setStartDate(todayIso)
      setEndDate(todayIso)
      setReason("")
    }
    catch (err) { console.error("Submit error:", err) }
    finally { setLoading(false) }
  }

  return (
    <ContentForm>
      <ContentForm.Header>
        <ContentInformation title="Change shift form" subtitle="Send a change shift request to another employee"
          show buttonText="History" href="/employee/dashboard/attendance/change-shift/history" variant="outline"
        />
      </ContentForm.Header>

      <ContentForm.Body>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
          <div className="space-y-2">
            <Label>Select Employee</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between text-left"
                  disabled={loading}
                >
                  {selectedUser ? employees.find(e => String(e.id) === selectedUser)?.name : "Search employee..."}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[420px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search by name or email..." />

                  <CommandList className="p-2">
                    <CommandEmpty>No employee found.</CommandEmpty>

                    {employees.map(emp => (
                      <CommandItem
                        key={emp.id}
                        value={`${emp.name} ${emp.email}`}
                        onSelect={() => setSelectedUser(String(emp.id))}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-600">
                            {emp.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {emp.email}
                          </span>
                        </div>

                        <span className={`text-xs px-2 py-0.5 rounded-sm ${shiftStyles[emp.shift?.type]}`}>{capitalize(emp.shift?.type || "No Shift")}</span>

                        {selectedUser === String(emp.id) && (
                          <Check className="ml-auto h-4 w-4 opacity-60" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <p className="text-xs text-slate-400">
              Search by employee name or email.
            </p>
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

          <div className="flex items-center space-x-2 justify-start">
            <Button variant="outline" onClick={handleCancel} disabled={disabled}>
              Cancel
            </Button>
            <Button type="submit" disabled={disabled}>
              {loading && <Loader className="animate-spin mr-2 h-4 w-4" />}
              Submit Request
            </Button>
          </div>
        </form>
      </ContentForm.Body>
    </ContentForm>
  )
}
