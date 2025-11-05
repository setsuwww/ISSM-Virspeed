"use client"

import { useToast } from "@/_components/client/Toast-Provider"
import {
  toggleDivisionStatus,
  deleteDivision,
  deleteAllDivisions,
  bulkToggleDivisions,
} from "@/_components/server/divisionAction"

export function useHandleDivisions({ filteredData, selectedIds, setSelectedIds, mutate }) {
  const { addToast } = useToast()

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = (checked) => {
    if (checked) { const allIds = filteredData.map((d) => d.id)
      setSelectedIds(allIds)
    } else {
      setSelectedIds([])
    }
  }

  const onToggleStatus = async (division) => {
    try {
      await toggleDivisionStatus(division.id)
      addToast({
        title: "Status updated",
        description: `Division "${division.name}" status successfully changed.`,
      })
      mutate && mutate()
    } catch (error) {
      console.error(error)
      addToast({
        title: "Error",
        description: "Failed to update division status.",
        variant: "destructive",
      })
    }
  }

  const onDelete = async (division) => {
    if (!confirm(`Delete ${division.name}?`)) return
    try {
      await deleteDivision(division.id)
      addToast({
        title: "Division deleted",
        description: `"${division.name}" has been removed.`,
      })
      mutate && mutate()
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to delete division.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0)
      return addToast({
        title: "No selection",
        description: "Please select at least one division to delete.",
        variant: "destructive",
      })

    if (!confirm("Delete selected divisions?")) return

    for (const id of selectedIds) await deleteDivision(id)
    setSelectedIds([])

    addToast({
      title: "Divisions deleted",
      description: "Selected divisions have been successfully removed.",
    })

    mutate && mutate()
  }

  const handleDeleteAll = async () => {
    if (!confirm("Delete ALL divisions?")) return
    await deleteAllDivisions()

    addToast({
      title: "All divisions deleted",
      description: "All divisions have been successfully removed.",
    })

    mutate && mutate()
  }

  const onBulkUpdate = async (payload) => {
    try {
      await bulkToggleDivisions(payload)
      addToast({
        title: "Bulk update complete",
        description: `All divisions updated to ${payload.isActive ? "active" : "inactive"} mode.`,
      })
      mutate && mutate()
    } catch (err) {
      addToast({
        title: "Error",
        description: "Failed to bulk update divisions.",
        variant: "destructive",
      })
    }
  }

  return {
    toggleSelect,
    toggleSelectAll,
    onToggleStatus,
    onDelete,
    handleDeleteSelected,
    handleDeleteAll,
    onBulkUpdate,
  }
}
