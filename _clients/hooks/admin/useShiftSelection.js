"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { formatJakarta } from "@/_lib/time"
import { deleteMultipleShiftAssignments, bulkAssignPreset } from "@/_servers/admin-services/shift_assignment_action"
import { useConfirmStore } from "@/_stores/common/useConfirmStore"

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
