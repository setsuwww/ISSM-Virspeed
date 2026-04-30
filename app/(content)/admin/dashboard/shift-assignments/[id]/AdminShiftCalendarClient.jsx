"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/Card"
import { Button } from "@/_components/ui/Button"
import { Input } from "@/_components/ui/Input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/_components/ui/Dialog"

import { createOrUpdateShiftAssignment, deleteShiftAssignment, bulkAssignShift } from "@/_servers/admin-services/shift_assignment_action"
import { getShiftStyle } from "@/_components/_constants/shiftConstants"

const formatTime = (minutes) => {
  if (minutes == null) return "--:--";
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export default function AdminShiftCalendarClient({ user, assignments = [], shifts = [], selectedMonth }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingAction, setLoadingAction] = useState(false)

  // Only show shifts that match the user's location
  const availableShifts = (shifts || []).filter(s => s.locationId === user.locationId)
  const hasAvailableShifts = availableShifts.length > 0

  // Single Edit Modal State
  const [singleModalOpen, setSingleModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [existingAssignment, setExistingAssignment] = useState(null)
  const [formShiftId, setFormShiftId] = useState("")

  // Bulk Edit Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkStartDate, setBulkStartDate] = useState("")
  const [bulkEndDate, setBulkEndDate] = useState("")
  const [bulkPattern, setBulkPattern] = useState([""])

  // Safe parsing of current date
  let currentDate
  try {
    currentDate = selectedMonth ? parseISO(selectedMonth + "-01") : new Date()
    if (isNaN(currentDate.getTime())) currentDate = new Date()
  } catch (e) {
    currentDate = new Date()
  }

  const start = startOfMonth(currentDate)
  const end = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start, end })

  const firstDayOfMonth = start.getDay()
  const emptyDays = Array(firstDayOfMonth).fill(null)

  const handlePrevMonth = () => {
    const prev = subMonths(currentDate, 1)
    router.push(`?month=${format(prev, "yyyy-MM")}`)
  }

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1)
    router.push(`?month=${format(next, "yyyy-MM")}`)
  }

  const openSingleModal = (day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    const assignment = assignments.find(a => a?.date && format(new Date(a.date), "yyyy-MM-dd") === dateStr)

    setSelectedDate(day)
    setExistingAssignment(assignment || null)
    setFormShiftId(assignment?.shiftId?.toString() || "")
    setSingleModalOpen(true)
  }

  const handleSaveSingle = async () => {
    if (!formShiftId) return alert("Please select a shift")
    setLoadingAction(true)

    const res = await createOrUpdateShiftAssignment({
      userId: user?.id,
      date: selectedDate?.toISOString(),
      shiftId: parseInt(formShiftId),
      isManualOverride: true
    })

    if (res?.success) {
      setSingleModalOpen(false)
    } else {
      alert(res?.error || "Failed to save assignment")
    }
    setLoadingAction(false)
  }

  const handleDeleteSingle = async () => {
    if (!existingAssignment?.id) return
    if (!confirm("Are you sure you want to remove this shift assignment?")) return

    setLoadingAction(true)
    const res = await deleteShiftAssignment(existingAssignment.id, user?.id)
    if (res?.success) {
      setSingleModalOpen(false)
    } else {
      alert(res?.error || "Failed to delete assignment")
    }
    setLoadingAction(false)
  }

  const handleSaveBulk = async () => {
    if (!bulkStartDate || !bulkEndDate) return alert("Please select start and end dates")
    const validPattern = bulkPattern.filter(p => p !== "")
    if (validPattern.length === 0) return alert("Please select at least one shift in the pattern")

    setLoadingAction(true)
    const res = await bulkAssignShift({
      userId: user?.id,
      startDate: new Date(bulkStartDate).toISOString(),
      endDate: new Date(bulkEndDate).toISOString(),
      shiftPattern: validPattern.map(id => parseInt(id))
    })

    if (res?.success) {
      setBulkModalOpen(false)
      alert(`Successfully assigned ${res.count} shifts`)
    } else {
      alert(res?.error || "Failed to bulk assign shifts")
    }
    setLoadingAction(false)
  }

  return (
    <div className="w-full relative">
      {(isPending || loadingAction) && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      <Card className="shadow-sm rounded-xl border-slate-200 overflow-hidden mb-6 bg-white !p-0">
        <div className="bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-full p-1">
              <button onClick={handlePrevMonth} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-red-600 min-w-[130px] text-center text-sm">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button
            onClick={() => setBulkModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Bulk Assign
          </Button>
        </div>

        <CardContent className="p-4 !pt-0 sm:p-6 bg-white">
          <div className="grid grid-cols-7 gap-2 mb-4 bg-slate-100 rounded-md">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-slate-500 py-2 hidden sm:block">
                {day}
              </div>
            ))}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2 sm:hidden">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-slate-300/30 rounded-lg hidden sm:block"></div>
            ))}
            {daysInMonth.map(day => {
              const dateStr = format(day, "yyyy-MM-dd")
              const shiftAssignmentForDay = assignments.find(a => a?.date && format(new Date(a.date), "yyyy-MM-dd") === dateStr)

              // Safe nested checks
              const shiftData = shiftAssignmentForDay?.shift
              const isTodayDate = isToday(day)
              const hasShift = !!shiftData
              const shiftType = shiftData?.type || 'OFF'

              let containerClass = "min-h-[90px] sm:min-h-[120px] p-2 sm:p-3 rounded-lg border transition-all flex flex-col gap-1 relative cursor-pointer hover:-translate-y-0.5 group "

              if (isTodayDate) { containerClass += "bg-blue-50/20 border-blue-400" }
              else if (hasShift) { containerClass += "bg-white border-slate-300" }
              else { containerClass += "bg-slate-50 border-slate-300 border-dashed hover:border-blue-500 hover:bg-blue-50" }

              return (
                <div key={day.toString()} className={containerClass} onClick={() => openSingleModal(day)}>
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${isTodayDate ? 'text-blue-700' : 'text-slate-600'}`}>
                      {format(day, "d")}
                    </span>
                    {isTodayDate && (
                      <span className="hidden sm:inline-block text-[9px] font-bold uppercase text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </div>

                  {hasShift ? (
                    <div className={`mt-auto border rounded p-1.5 sm:p-2 flex flex-col items-center justify-center text-center ${getShiftStyle(shiftType)}`}>
                      <span className="font-semibold text-xs sm:text-sm truncate w-full">
                        {shiftType}
                      </span>
                      {shiftType !== 'OFF' && (
                        <span className="text-[10px] sm:text-xs opacity-80 mt-0.5 hidden sm:inline-block truncate w-full">
                          {formatTime(shiftData?.startTime)} - {formatTime(shiftData?.endTime)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-auto text-xs text-green-600 text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <Plus className="w-3 h-3" /> Assign
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Single Edit Modal */}
      <Dialog open={singleModalOpen} onOpenChange={setSingleModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white" showCloseButton={false}>
          <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg">
              {existingAssignment ? 'Edit Assignment' : 'New Assignment'}
            </DialogTitle>
            <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200">
              {selectedDate ? format(selectedDate, "dd MMM yyyy") : ""}
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Shift</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formShiftId}
                onChange={(e) => setFormShiftId(e.target.value)}
              >
                <option value="">-- Choose Shift --</option>
                {hasAvailableShifts ? (
                  availableShifts.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                  ))
                ) : (
                  <option value="" disabled className="text-rose-500 font-semibold">
                    Tidak ada shift tersedia di lokasi ini
                  </option>
                )}
              </select>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex sm:justify-between items-center gap-2">
            {existingAssignment ? (
              <Button
                variant="destructive"
                onClick={handleDeleteSingle}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : <div className="hidden sm:block"></div>}

            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => setSingleModalOpen(false)}
                className="w-full sm:w-auto bg-white"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveSingle}
                className="w-full sm:w-auto"
                disabled={!hasAvailableShifts}
              >
                Save Shift
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Modal */}
      <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <DialogTitle className="text-lg">Bulk Shift Assignment</DialogTitle>
            <p className="text-sm text-slate-500">Apply a repeating rotation pattern over a date range.</p>
          </DialogHeader>

          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  typeDate={true}
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <Input
                  type="date"
                  typeDate={true}
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Shift Rotation Pattern</label>
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {bulkPattern.map((patternVal, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xs font-semibold text-slate-400 w-12 uppercase">Day {idx + 1}</span>
                    <select
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      value={patternVal}
                      onChange={(e) => {
                        const newPat = [...bulkPattern]
                        newPat[idx] = e.target.value
                        setBulkPattern(newPat)
                      }}
                    >
                      <option value="">-- Choose Shift --</option>
                      {hasAvailableShifts ? (
                        availableShifts.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                        ))
                      ) : (
                        <option value="" disabled className="text-rose-500 font-semibold">
                          Tidak ada shift tersedia di lokasi ini
                        </option>
                      )}
                    </select>
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
                <Button
                  variant="link"
                  onClick={() => setBulkPattern([...bulkPattern, ""])}
                  className="mt-2 text-sm text-blue-600 font-medium flex items-center gap-1 !p-0 !h-auto"
                >
                  <Plus className="w-3 h-3" /> Add Rotation Day
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setBulkModalOpen(false)}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveBulk}
              disabled={!hasAvailableShifts}
            >
              Apply Pattern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
