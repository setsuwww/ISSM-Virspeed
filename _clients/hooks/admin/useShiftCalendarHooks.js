"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, parseISO, min, max } from "date-fns"
import { createOrUpdateShiftAssignment, deleteShiftAssignment, bulkAssignShift, bulkAssignPreset, deleteMultipleShiftAssignments, deleteAllAssignments } from "@/_servers/admin-services/shift_assignment_action"
import { useConfirmStore } from "@/_stores/common/useConfirmStore"

/**
 * Helper to calculate duration breakdown
 */
export const calculateDuration = (dates) => {
  if (!dates || dates.length === 0) return null
  
  const totalDays = dates.length
  const weeks = Math.floor(totalDays / 7)
  const remainingDays = totalDays % 7
  
  const dateObjs = dates.map(d => new Date(d))
  const start = min(dateObjs)
  const end = max(dateObjs)
  
  return {
    totalDays,
    weeks,
    remainingDays,
    start,
    end,
    formattedRange: `${format(start, "dd MMM yyyy")} - ${format(end, "dd MMM yyyy")}`,
    breakdown: `${totalDays} days${weeks > 0 ? ` = ${weeks} week${weeks > 1 ? 's' : ''}${remainingDays > 0 ? ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : ''}` : ''}`
  }
}

export const useShiftCalendarHooks = ({ user, assignments = [], shifts = [], selectedMonth }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingAction, setLoadingAction] = useState(false)

  // O(1) Lookup Map
  const assignmentMap = useMemo(() => {
    const map = {}
    assignments.forEach(a => {
      if (a?.date) {
        const dateStr = format(new Date(a.date), "yyyy-MM-dd")
        map[dateStr] = a
      }
    })
    return map
  }, [assignments])

  const availableShifts = useMemo(() => 
    (shifts || []).filter(s => s.locationId === user.locationId),
    [shifts, user.locationId]
  )
  const hasAvailableShifts = availableShifts.length > 0

  const [singleModalOpen, setSingleModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [existingAssignment, setExistingAssignment] = useState(null)
  const [formShiftId, setFormShiftId] = useState("")

  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkStartDate, setBulkStartDate] = useState("")
  const [bulkEndDate, setBulkEndDate] = useState("")
  const [bulkPattern, setBulkPattern] = useState([""])

  let currentDate
  try {
    currentDate = selectedMonth ? parseISO(selectedMonth + "-01") : new Date()
    if (isNaN(currentDate.getTime())) currentDate = new Date()
  } catch (e) {
    currentDate = new Date()
  }

  const start = startOfMonth(currentDate)
  const end = endOfMonth(currentDate)
  const daysInMonth = useMemo(() => eachDayOfInterval({ start, end }), [start, end])
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
    const assignment = assignmentMap[dateStr]

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

    const confirm = await useConfirmStore.getState().ask(
      "Are you sure you want to remove this shift assignment?",
      "danger"
    )
    if (!confirm) return

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

  const handleDeleteAll = async () => {
    const confirm = await useConfirmStore.getState().ask(
      "Are you sure you want to delete ALL shift assignments for this user? This action cannot be undone.",
      "danger"
    )
    if (!confirm) return

    setLoadingAction(true)
    const res = await deleteAllAssignments(user?.id)
    if (res?.success) {
      alert("All assignments deleted successfully")
    } else {
      alert(res?.error || "Failed to delete all assignments")
    }
    setLoadingAction(false)
  }

  return {
    assignmentMap,
    isPending,
    loadingAction,
    availableShifts,
    hasAvailableShifts,
    singleModalOpen,
    setSingleModalOpen,
    selectedDate,
    existingAssignment,
    formShiftId,
    setFormShiftId,
    bulkModalOpen,
    setBulkModalOpen,
    bulkStartDate,
    setBulkStartDate,
    bulkEndDate,
    setBulkEndDate,
    bulkPattern,
    setBulkPattern,
    currentDate,
    daysInMonth,
    emptyDays,
    handlePrevMonth,
    handleNextMonth,
    openSingleModal,
    handleSaveSingle,
    handleDeleteSingle,
    handleSaveBulk,
    handleDeleteAll
  }
}

export const useShiftSelection = (userId, assignmentMap) => {
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedDates, setSelectedDates] = useState([]) // format: yyyy-MM-dd
  const [loading, setLoading] = useState(false)

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    setSelectedDates([])
  }

  const toggleDateSelection = (date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    setSelectedDates(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    )
  }

  const selectAll = (days) => {
    const allDates = days.map(d => format(d, "yyyy-MM-dd"))
    setSelectedDates(allDates)
  }

  const filledDates = selectedDates.filter(dateStr => !!assignmentMap[dateStr])
  const emptyDates = selectedDates.filter(dateStr => !assignmentMap[dateStr])

  const handleBulkDelete = async () => {
    if (filledDates.length === 0) return

    const confirm = await useConfirmStore.getState().ask(
      `Are you sure you want to delete ${filledDates.length} shift assignments?`,
      "danger"
    )
    if (!confirm) return

    setLoading(true)
    const res = await deleteMultipleShiftAssignments(filledDates, userId)
    if (res?.success) {
      setSelectedDates(prev => prev.filter(d => !filledDates.includes(d)))
      if (selectedDates.length === filledDates.length) setIsSelectMode(false)
    } else {
      alert(res?.error || "Failed to delete assignments")
    }
    setLoading(false)
  }

  // individualValues: { [dateStr]: shiftId }
  const handleBulkSubmit = async (individualValues, modalType) => {
    setLoading(true)
    
    // We can use bulkAssignPreset by grouping dates by shiftId
    const groups = {}
    Object.entries(individualValues).forEach(([date, shiftId]) => {
      if (!groups[shiftId]) groups[shiftId] = []
      groups[shiftId].push(date)
    })

    const promises = Object.entries(groups).map(([shiftId, dates]) => 
      bulkAssignPreset({
        userId,
        dates,
        shiftId: parseInt(shiftId)
      })
    )

    const results = await Promise.all(promises)
    const allSuccess = results.every(r => r.success)

    if (allSuccess) {
      if (modalType === 'assign') setAssignModalOpen(false)
      else setEditModalOpen(false)
      setSelectedDates([])
      setIsSelectMode(false)
    } else {
      alert("Some assignments failed to save")
    }
    setLoading(false)
  }

  return {
    isSelectMode,
    selectedDates,
    toggleSelectMode,
    toggleDateSelection,
    selectAll,
    handleBulkDelete,
    filledDates,
    emptyDates,
    assignModalOpen,
    setAssignModalOpen,
    editModalOpen,
    setEditModalOpen,
    handleBulkSubmit,
    loading
  }
}

export const useBulkPreset = (userId, daysInMonth, assignmentMap) => {
  const [presetMode, setPresetMode] = useState("WEEK") // WEEK or MONTH
  const [presetShiftId, setPresetShiftId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleApplyPreset = async (actionType) => {
    if (!presetShiftId) return alert("Please select a shift first")

    let targetDates = []
    const today = new Date()

    if (presetMode === "WEEK") {
      const end = addDays(today, 6)
      targetDates = eachDayOfInterval({ start: today, end }).map(d => format(d, "yyyy-MM-dd"))
    } else {
      // Remaining days in current month from today
      const end = endOfMonth(today)
      if (today > end) return alert("Month already ended")
      targetDates = eachDayOfInterval({ start: today, end }).map(d => format(d, "yyyy-MM-dd"))
    }

    // Filter based on actionType
    if (actionType === 'assign') {
      targetDates = targetDates.filter(d => !assignmentMap[d])
    }
    // If edit, we take all targetDates as override

    if (targetDates.length === 0) return alert("No dates to apply this preset to")

    setLoading(true)
    const res = await bulkAssignPreset({
      userId,
      dates: targetDates,
      shiftId: parseInt(presetShiftId)
    })

    if (res?.success) {
      alert(`Successfully applied preset to ${res.count} days`)
      setPresetShiftId("")
    } else {
      alert(res?.error || "Failed to apply preset")
    }
    setLoading(false)
  }

  return {
    presetMode,
    setPresetMode,
    presetShiftId,
    setPresetShiftId,
    handleApplyPreset,
    loading
  }
}
