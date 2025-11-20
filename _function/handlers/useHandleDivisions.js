"use client"

import { useToast } from "@/_components/client/Toast-Provider"
import { toggleDivisionStatus, deleteDivision, deleteAllDivisions, bulkToggleSelectedDivision } from "@/_components/server/divisionAction"
import { exportDivision } from "../exports/exportDivision"
import { useRouter } from "next/navigation"

export function useHandleDivisions({ filteredData, selectedIds, setSelectedIds, mutate }) {
  const toast = useToast()
  const router = useRouter()

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const toggleSelectAll = (checked) => {
    if (checked) { const allIds = filteredData.map((d) => d.id)
      setSelectedIds(allIds)
    } else { setSelectedIds([])}
  }

  const onToggleStatus = async (division) => {
    try { await toggleDivisionStatus(division.id)
      toast.success(`Division "${division.name}" status successfully changed.`)
      mutate && mutate()
    } catch (error) { toast.error("Failed to update division status.")}
  }

  const onDelete = async (id) => {
    if (!confirm(`Delete this division?`)) return
    try { await deleteDivision(id)
      toast.success(`"Division has been removed.`)
      mutate && mutate()
    } catch { toast.error("Failed to delete division.")}
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0)
      return toast.error("Please select at least one division to delete.")

    if (!confirm("Delete selected divisions?")) return

    for (const id of selectedIds) await deleteDivision(id)
    setSelectedIds([])

    toast.success("Selected divisions have been successfully removed.")
    mutate && mutate()
  }

  const handleDeleteAll = async () => {
    if (!confirm("Delete ALL divisions?")) return

    await deleteAllDivisions()
    toast.success("All divisions have been successfully removed.")
    mutate && mutate()
  }

  const onBulkUpdate = async (ids, mode) => {
    const payload = { ids, isActive: mode === "ACTIVE"};

    try { await bulkToggleSelectedDivision(payload);

      toast.success(`All selected divisions updated to ${payload.isActive ? "active" : "inactive"}.`);
      mutate && mutate();
    } 
    catch {toast.error("Failed to bulk update divisions.")}
  };

  const onEdit = (division) => { router.push(`/admin/dashboard/users/divisions/${division}/edit`)}

  const handleExportPDF = () => {
    if (!filteredData?.length) { toast.error("No divisions to export.")
      return
    }

    try { exportDivision(filteredData)
      toast.success("Division data exported as PDF.")
    } catch { toast.error("An error occurred while exporting.")}
  }

  return {
    toggleSelect, toggleSelectAll,
    onToggleStatus,
    onEdit, onDelete,
    handleExportPDF,
    handleDeleteSelected, handleDeleteAll,
    onBulkUpdate,
  }
}
