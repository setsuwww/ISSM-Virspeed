"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { deleteScheduleById, deleteSchedules } from "@/_components/server/scheduleAction"
import { exportSchedule } from "../exports/exportSchedule"
import { useToast } from "@/_components/client/Toast-Provider"

export function useHandleSchedules({ selectedIds, setSelectedIds, filteredData, reloadData }) {
  const router = useRouter()
  const { addToast } = useToast()

  const toggleSelect = useCallback(
    (id) => { setSelectedIds((prev) => prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id])},
    [setSelectedIds]
  )

  const selectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === filteredData.length ? [] : filteredData.map((s) => s.id)
    )
  }, [filteredData, setSelectedIds])

  const deleteSelected = useCallback(async () => {
    if (!selectedIds.length) return
    if (!confirm("Are you sure you want to delete selected schedules?")) return

    try {
      await deleteSchedules(selectedIds)
      alert("Deleted selected schedules")
      setSelectedIds([])
      reloadData()
    } catch (err) {
      console.error(err)
      alert("Failed to delete selected")
    }
  }, [selectedIds, setSelectedIds, reloadData])

  const deleteAll = useCallback(async () => {
    if (!filteredData.length) return
    if (!confirm("Are you sure you want to delete ALL schedules?")) return

    try {
      await deleteSchedules(filteredData.map((s) => s.id))
      alert("All schedules deleted")
      setSelectedIds([])
      reloadData()
    } catch (err) {
      console.error(err)
      alert("Failed to delete all")
    }
  }, [filteredData, setSelectedIds, reloadData])

  const handleEditSchedule = useCallback(
    (id) => router.push(`/admin/dashboard/schedules/${id}/edit`),
    [router]
  )

  const handleDeleteSchedule = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to delete this schedule?")) return
      try {
        await deleteScheduleById(id)
        alert("Schedule deleted")
        setSelectedIds((prev) => prev.filter((sid) => sid !== id))
        reloadData()
      } catch (err) {
        console.error(err)
        alert("Failed to delete")
      }
    },
    [setSelectedIds, reloadData]
  )

  const onExportPDF = useCallback((data) => {
    exportSchedule(data)
    addToast("PDF exported successfully", { type: "success" })
  }, [addToast])

  return {
    toggleSelect,
    selectAll,
    deleteSelected,
    deleteAll,
    handleEditSchedule,
    handleDeleteSchedule,
    onExportPDF,
  }
}
