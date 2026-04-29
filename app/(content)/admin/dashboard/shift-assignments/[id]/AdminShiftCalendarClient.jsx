"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, parseISO, formatISO } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/Card"
import { Badge } from "@/_components/ui/Badge"
import { createOrUpdateShiftAssignment, deleteShiftAssignment, bulkAssignShift } from "@/_servers/admin-services/shift_assignment_action"

const getShiftStyle = (type) => {
  switch (type?.toUpperCase()) {
    case 'MORNING': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'AFTERNOON': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'EVENING': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'OFF': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}

const formatTime = (minutes) => {
  if (minutes == null) return null;
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export default function AdminShiftCalendarClient({ user, assignments, shifts, selectedMonth }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingAction, setLoadingAction] = useState(false)

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

  const currentDate = parseISO(selectedMonth + "-01")
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
    const assignment = assignments.find(a => format(new Date(a.date), "yyyy-MM-dd") === dateStr)
    setSelectedDate(day)
    setExistingAssignment(assignment || null)
    setFormShiftId(assignment?.shiftId?.toString() || "")
    setSingleModalOpen(true)
  }

  const handleSaveSingle = async () => {
    if (!formShiftId) return alert("Please select a shift")
    setLoadingAction(true)

    const res = await createOrUpdateShiftAssignment({
      userId: user.id,
      date: selectedDate.toISOString(),
      shiftId: parseInt(formShiftId),
      isManualOverride: true
    })

    if (res.success) {
      setSingleModalOpen(false)
    } else {
      alert(res.error)
    }
    setLoadingAction(false)
  }

  const handleDeleteSingle = async () => {
    if (!existingAssignment) return
    if (!confirm("Are you sure you want to remove this shift assignment?")) return

    setLoadingAction(true)
    const res = await deleteShiftAssignment(existingAssignment.id, user.id)
    if (res.success) {
      setSingleModalOpen(false)
    } else {
      alert(res.error)
    }
    setLoadingAction(false)
  }

  const handleSaveBulk = async () => {
    if (!bulkStartDate || !bulkEndDate) return alert("Please select start and end dates")
    const validPattern = bulkPattern.filter(p => p !== "")
    if (validPattern.length === 0) return alert("Please select at least one shift in the pattern")

    setLoadingAction(true)
    const res = await bulkAssignShift({
      userId: user.id,
      startDate: new Date(bulkStartDate).toISOString(),
      endDate: new Date(bulkEndDate).toISOString(),
      shiftPattern: validPattern.map(id => parseInt(id))
    })

    if (res.success) {
      setBulkModalOpen(false)
      alert(`Successfully assigned ${res.count} shifts`)
    } else {
      alert(res.error)
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

      <Card className="shadow-sm rounded-xl border-slate-200 overflow-hidden mb-6 bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-white">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700 min-w-[130px] text-center text-sm">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setBulkModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <CalendarIcon className="w-4 h-4" />
            Bulk Assign
          </button>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 bg-white">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2 hidden sm:block">
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
              <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-slate-50/30 rounded-lg hidden sm:block"></div>
            ))}
            {daysInMonth.map(day => {
              const dateStr = format(day, "yyyy-MM-dd")
              const shiftForDay = assignments.find(a => format(new Date(a.date), "yyyy-MM-dd") === dateStr)
              const isTodayDate = isToday(day)

              let containerClass = "min-h-[90px] sm:min-h-[120px] p-2 sm:p-3 rounded-lg border transition-all flex flex-col gap-1 relative cursor-pointer hover:shadow-md hover:-translate-y-0.5 group "

              if (isTodayDate) {
                containerClass += "bg-blue-50/20 border-blue-400 shadow-sm"
              } else if (shiftForDay) {
                containerClass += "bg-white border-slate-200"
              } else {
                containerClass += "bg-slate-50 border-slate-200 border-dashed hover:border-blue-300 hover:bg-blue-50/30"
              }

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

                  {shiftForDay ? (
                    <div className={`mt-auto border rounded p-1.5 sm:p-2 flex flex-col items-center justify-center text-center ${getShiftStyle(shiftForDay.shift?.type)}`}>
                      <span className="font-semibold text-xs sm:text-sm truncate w-full">{shiftForDay.shift?.type || 'OFF'}</span>
                      {shiftForDay?.shift && shiftForDay.shift.type !== 'OFF' && (
                        <span className="text-[10px] sm:text-xs opacity-80 mt-0.5 hidden sm:inline-block truncate w-full">
                          {formatTime(shiftForDay.shift.startTime)} - {formatTime(shiftForDay.shift.endTime)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-auto text-xs text-slate-400 text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
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
      {singleModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">
                {existingAssignment ? 'Edit Assignment' : 'New Assignment'}
              </h3>
              <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200">
                {format(selectedDate, "dd MMM yyyy")}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Shift</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formShiftId}
                  onChange={(e) => setFormShiftId(e.target.value)}
                >
                  <option value="">-- Choose Shift --</option>
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between">
              {existingAssignment ? (
                <button
                  onClick={handleDeleteSingle}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              ) : <div></div>}
              <div className="flex gap-2">
                <button
                  onClick={() => setSingleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSingle}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">Bulk Shift Assignment</h3>
              <p className="text-sm text-slate-500">Apply a repeating rotation pattern over a date range.</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={bulkStartDate}
                    onChange={(e) => setBulkStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={bulkEndDate}
                    onChange={(e) => setBulkEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={patternVal}
                        onChange={(e) => {
                          const newPat = [...bulkPattern]
                          newPat[idx] = e.target.value
                          setBulkPattern(newPat)
                        }}
                      >
                        <option value="">-- Choose Shift --</option>
                        {shifts.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                        ))}
                      </select>
                      {bulkPattern.length > 1 && (
                        <button
                          onClick={() => setBulkPattern(bulkPattern.filter((_, i) => i !== idx))}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setBulkPattern([...bulkPattern, ""])}
                    className="mt-2 text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Rotation Day
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBulk}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Apply Pattern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
