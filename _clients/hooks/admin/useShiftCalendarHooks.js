"use client"

import { useState, useRef, useTransition, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { formatJakarta, parseJakarta, getNowJakarta, getJakartaMonthDetails } from "@/_lib/time"
import { min, max, format } from "date-fns"
import {
  createOrUpdateShiftAssignment,
  deleteShiftAssignment,
  bulkAssignShift,
  deleteMultipleShiftAssignments,
  deleteAllAssignments,
  bulkAssignPreset
} from "@/_servers/admin-services/shift_assignment_action"
import { useConfirmStore } from "@/_stores/common/useConfirmStore"
import {
  generateSamePattern,
  generateSortPattern,
  generateRotationPattern,
  getRotationVariations
} from "@/_lib/shiftPatternHelpers"

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

export const useShiftSelection = (userId, assignmentMap, daysInMonth) => {
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedDates, setSelectedDates] = useState([]) // YYYY-MM-DD strings
  const [loading, setLoading] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const lastSelectedIndexRef = useRef(-1)
  const isDraggingRef = useRef(false)

  // Map dates to indices for O(1) range calculation
  const dateToIndexMap = useMemo(() => {
    const map = {}
    daysInMonth.forEach((day, i) => {
      map[formatJakarta(day, "YYYY-MM-DD")] = i
    })
    return map
  }, [daysInMonth])

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode(prev => !prev)
    setSelectedDates([])
    lastSelectedIndexRef.current = -1
  }, [])

  const calculateRange = useCallback((startIdx, endIdx) => {
    const from = Math.min(startIdx, endIdx)
    const to = Math.max(startIdx, endIdx)
    const range = []
    for (let i = from; i <= to; i++) {
      range.push(formatJakarta(daysInMonth[i], "YYYY-MM-DD"))
    }
    return range
  }, [daysInMonth])

  const toggleDateSelection = useCallback((date, isShiftKey = false) => {
    const dateStr = formatJakarta(date, "YYYY-MM-DD")
    const currentIdx = dateToIndexMap[dateStr]

    if (isShiftKey && lastSelectedIndexRef.current !== -1) {
      const range = calculateRange(lastSelectedIndexRef.current, currentIdx)
      setSelectedDates(prev => [...new Set([...prev, ...range])])
    } else {
      setSelectedDates(prev =>
        prev.includes(dateStr)
          ? prev.filter(d => d !== dateStr)
          : [...prev, dateStr]
      )
      lastSelectedIndexRef.current = currentIdx
    }
  }, [calculateRange, dateToIndexMap])

  const selectAll = useCallback(() => {
    const all = daysInMonth.map(d => formatJakarta(d, "YYYY-MM-DD"))
    setSelectedDates(all)
  }, [daysInMonth])

  const handleDragStart = useCallback((date) => {
    if (!isSelectMode) return
    isDraggingRef.current = true
    const dateStr = formatJakarta(date, "YYYY-MM-DD")
    lastSelectedIndexRef.current = dateToIndexMap[dateStr]
    setSelectedDates(prev => prev.includes(dateStr) ? prev : [...prev, dateStr])
  }, [isSelectMode, dateToIndexMap])

  const handleDragEnter = useCallback((date) => {
    if (!isDraggingRef.current || lastSelectedIndexRef.current === -1) return
    const dateStr = formatJakarta(date, "YYYY-MM-DD")
    const currentIdx = dateToIndexMap[dateStr]
    const range = calculateRange(lastSelectedIndexRef.current, currentIdx)
    setSelectedDates(prev => [...new Set([...prev, ...range])])
  }, [calculateRange, dateToIndexMap])

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const filledDates = useMemo(() =>
    selectedDates.filter(d => !!assignmentMap[d]),
    [selectedDates, assignmentMap]
  )

  const emptyDates = useMemo(() =>
    selectedDates.filter(d => !assignmentMap[d]),
    [selectedDates, assignmentMap]
  )

  const handleBulkDelete = useCallback(async () => {
    if (filledDates.length === 0) return
    const confirm = await useConfirmStore.getState().ask(
      `Delete ${filledDates.length} assignments?`, "danger"
    )
    if (!confirm) return

    setLoading(true)
    const res = await deleteMultipleShiftAssignments(filledDates, userId)
    if (res?.success) {
      setSelectedDates(prev => prev.filter(d => !filledDates.includes(d)))
    } else {
      alert(res?.error || "Error")
    }
    setLoading(false)
  }, [filledDates, userId])

  const handleBulkSubmit = useCallback(async (values, type) => {
    setLoading(true)
    const groups = {}
    Object.entries(values).forEach(([date, shiftId]) => {
      if (shiftId) {
        if (!groups[shiftId]) groups[shiftId] = []
        groups[shiftId].push(date)
      }
    })

    const results = await Promise.all(
      Object.entries(groups).map(([shiftId, dates]) =>
        bulkAssignPreset({ userId, dates, shiftId: parseInt(shiftId) })
      )
    )

    if (results.every(r => r.success)) {
      setSelectedDates([])
      setIsSelectMode(false)
      if (type === 'assign') setAssignModalOpen(false)
      else setEditModalOpen(false)
    }
    setLoading(false)
  }, [userId])

  return {
    isSelectMode, selectedDates, setSelectedDates, toggleSelectMode, toggleDateSelection, selectAll,
    handleDragStart, handleDragEnter, handleDragEnd,
    handleBulkDelete, filledDates, emptyDates,
    assignModalOpen, setAssignModalOpen, editModalOpen, setEditModalOpen,
    handleBulkSubmit, loading
  }
}

export const useShiftPreset = (userId, availableShifts, selectedDates, setSelectedDates) => {
  const [presetType, setPresetType] = useState("SAME") // SAME, BY_TURNS
  const [startShiftId, setStartShiftId] = useState("")
  const [rotationIndex, setRotationIndex] = useState(0) // 0 for Sequential, >0 for Variations
  const [previewMap, setPreviewMap] = useState(null)
  const [loading, setLoading] = useState(false)

  // Memoized rotation variations + Sequential option
  const rotationOptions = useMemo(() => {
    if (!startShiftId) return []
    const variations = getRotationVariations(startShiftId, availableShifts)

    // The "Sequential" (BY_TURNS default) is essentially M-A-E or A-E-M etc.
    // I will prepend a "Sequential" logic to the options
    return variations
  }, [startShiftId, availableShifts])

  const currentPattern = useMemo(() => {
    if (!startShiftId) return null
    const len = selectedDates.length || 31

    if (presetType === "SAME") {
      return generateSamePattern(startShiftId, len)
    }

    if (presetType === "BY_TURNS") {
      const base = rotationOptions[rotationIndex]
      if (rotationIndex === 0 && !base) {
        // Fallback to sequential if variations not ready
        return generateSortPattern(startShiftId, availableShifts, len)
      }
      return generateRotationPattern(base, len)
    }

    return null
  }, [presetType, startShiftId, rotationIndex, rotationOptions, availableShifts, selectedDates.length])

  const handleHoverPreset = useCallback((isHovering) => {
    if (!isHovering || !currentPattern || selectedDates.length === 0) {
      setPreviewMap(null)
      return
    }

    const preview = {}
    const sortedDates = [...selectedDates].sort()
    sortedDates.forEach((date, i) => {
      const shiftId = currentPattern[i]
      if (shiftId) {
        preview[date] = availableShifts.find(s => String(s.id) === String(shiftId))
      }
    })
    setPreviewMap(preview)
  }, [currentPattern, selectedDates, availableShifts])

  const handleApplyPreset = useCallback(async () => {
    if (!startShiftId || selectedDates.length === 0) return

    const sortedDates = [...selectedDates].sort()
    const individualValues = {}
    sortedDates.forEach((date, i) => {
      const shiftId = currentPattern[i]
      if (shiftId) individualValues[date] = shiftId
    })

    setLoading(true)
    const groups = {}
    Object.entries(individualValues).forEach(([date, shiftId]) => {
      if (!groups[shiftId]) groups[shiftId] = []
      groups[shiftId].push(date)
    })

    const results = await Promise.all(
      Object.entries(groups).map(([shiftId, dates]) =>
        bulkAssignPreset({ userId, dates, shiftId: parseInt(shiftId) })
      )
    )

    if (results.every(r => r.success)) {
      setSelectedDates([])
      setPreviewMap(null)
    }
    setLoading(false)
  }, [currentPattern, selectedDates, startShiftId, userId, setSelectedDates])

  return {
    presetType, setPresetType,
    startShiftId, setStartShiftId,
    rotationIndex, setRotationIndex,
    rotationOptions,
    previewMap,
    handleHoverPreset,
    handleApplyPreset,
    loading
  }
}

