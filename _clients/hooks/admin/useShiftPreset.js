"use client"

import { useState, useCallback, useMemo } from "react"
import { bulkAssignPreset } from "@/_servers/admin-services/shift_assignment_action"
import { 
  generateSamePattern, 
  generateSortPattern, 
  generateRotationPattern, 
  getRotationVariations 
} from "@/_lib/shiftPatternHelpers"

/**
 * Enhanced Preset Hook
 * Types: SAME, BY_TURNS
 * BY_TURNS includes Sequential and custom Rotation Patterns
 */
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
