"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { formatJakarta, parseJakarta, getNowJakarta, getJakartaMonthDetails } from "@/_lib/time"
import { min, max, format } from "date-fns"
import { 
  createOrUpdateShiftAssignment, 
  deleteShiftAssignment, 
  bulkAssignShift, 
  deleteAllAssignments 
} from "@/_servers/admin-services/shift_assignment_action"
import { useConfirmStore } from "@/_stores/common/useConfirmStore"

/**
 * Helper to calculate duration breakdown
 */
export const calculateDuration = (dates) => {
  if (!dates || dates.length === 0) return null
  
  const totalDays = dates.length
  const weeks = Math.floor(totalDays / 7)
  const remainingDays = totalDays % 7
  
  const dateObjs = dates.map(d => parseJakarta(d).toDate())
  const start = min(dateObjs)
  const end = max(dateObjs)
  
  return {
    totalDays,
    weeks,
    remainingDays,
    start,
    end,
    formattedRange: `${formatJakarta(start, "DD MMM YYYY")} - ${formatJakarta(end, "DD MMM YYYY")}`,
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
        const dateStr = formatJakarta(a.date, "YYYY-MM-DD")
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

  const currentDate = useMemo(() => {
    try {
      const d = selectedMonth ? parseJakarta(selectedMonth + "-01") : getNowJakarta()
      return d.isValid() ? d : getNowJakarta()
    } catch (e) {
      return getNowJakarta()
    }
  }, [selectedMonth])

  const { days: daysInMonth, firstDayOfWeek } = useMemo(() => 
    getJakartaMonthDetails(currentDate), 
    [currentDate]
  )
  const emptyDays = Array(firstDayOfWeek).fill(null)

  const handlePrevMonth = () => {
    const prev = currentDate.clone().subtract(1, "month")
    router.push(`?month=${formatJakarta(prev, "YYYY-MM")}`)
  }

  const handleNextMonth = () => {
    const next = currentDate.clone().add(1, "month")
    router.push(`?month=${formatJakarta(next, "YYYY-MM")}`)
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
