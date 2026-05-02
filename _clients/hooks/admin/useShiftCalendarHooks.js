"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, parseISO } from "date-fns"
import { createOrUpdateShiftAssignment, deleteShiftAssignment, bulkAssignShift, bulkAssignPreset, deleteMultipleShiftAssignments, deleteAllAssignments } from "@/_servers/admin-services/shift_assignment_action"
import { useConfirmStore } from "@/_stores/common/useConfirmStore"

export const useShiftCalendarHooks = ({ user, assignments, shifts, selectedMonth }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingAction, setLoadingAction] = useState(false)

  // Filter available shifts for the user's location
  const availableShifts = (shifts || []).filter(s => s.locationId === user.locationId)
  const hasAvailableShifts = availableShifts.length > 0

  // Single Modal State
  const [singleModalOpen, setSingleModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [existingAssignment, setExistingAssignment] = useState(null)
  const [formShiftId, setFormShiftId] = useState("")

  // Bulk Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkStartDate, setBulkStartDate] = useState("")
  const [bulkEndDate, setBulkEndDate] = useState("")
  const [bulkPattern, setBulkPattern] = useState([""])

  // Date Calculations
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

  // Handlers
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
    // States
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

    // Actions
    handlePrevMonth,
    handleNextMonth,
    openSingleModal,
    handleSaveSingle,
    handleDeleteSingle,
    handleSaveBulk,
    handleDeleteAll
  }
}

export const useShiftSelection = (userId) => {
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedDates, setSelectedDates] = useState([]) // format: yyyy-MM-dd
  const [loading, setLoading] = useState(false)

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

  const handleBulkDelete = async () => {
    if (selectedDates.length === 0) return

    const confirm = await useConfirmStore.getState().ask(
      `Are you sure you want to delete ${selectedDates.length} shift assignments?`,
      "danger"
    )
    if (!confirm) return

    setLoading(false)
    setLoading(true)
    const res = await deleteMultipleShiftAssignments(selectedDates, userId)
    if (res?.success) {
      setSelectedDates([])
      setIsSelectMode(false)
    } else {
      alert(res?.error || "Failed to delete assignments")
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
    loading
  }
}

export const useBulkPreset = (userId) => {
  const [presetMode, setPresetMode] = useState("WEEK") // WEEK or MONTH
  const [presetShiftId, setPresetShiftId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleApplyPreset = async (currentDate) => {
    if (!presetShiftId) return alert("Please select a shift first")

    let dates = []
    const today = new Date()

    if (presetMode === "WEEK") {
      const end = addDays(today, 6)
      dates = eachDayOfInterval({ start: today, end }).map(d => format(d, "yyyy-MM-dd"))
    } else {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      dates = eachDayOfInterval({ start, end }).map(d => format(d, "yyyy-MM-dd"))
    }

    setLoading(true)
    const res = await bulkAssignPreset({
      userId,
      dates,
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

