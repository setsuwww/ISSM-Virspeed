"use client"

import { useCallback } from "react"
import { deleteUsers, deleteUserWithId, getUserWithId } from "@/_components/server/userAction"
import { exportUser } from "@/_function/exports/exportUser"
import { useToast } from "@/_components/client/Toast-Provider"
import { useRouter } from "next/navigation"

export function handleUsers({ filteredData, selectedIds, setSelectedIds }) {
  const toast = useToast()
  const router = useRouter()

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }, [setSelectedIds])

  const selectAll = useCallback((checked) => { setSelectedIds(checked ? filteredData.map((u) => u.id) : [])
  }, [filteredData, setSelectedIds])

  const isAllSelected = filteredData.length > 0 && selectedIds.length === filteredData.length

  const deleteSelected = useCallback(async () => {
    if (selectedIds.length === 0) return toast("No users selected")
    if (!confirm(`Delete ${selectedIds.length} selected users?`)) return

    try { await deleteUsers(selectedIds)
      toast.success("Selected users deleted")
      setSelectedIds([])
    } catch { toast.error("Failed to delete selected users")}
  }, [selectedIds, toast, setSelectedIds])

  const deleteAll = useCallback(async () => {
    if (!confirm("Delete ALL users?")) return
    try { await deleteUsers(filteredData.map((u) => u.id))
      toast.success("All users deleted")
      setSelectedIds([])
    } catch { toast.error("Failed to delete all users")}
  }, [filteredData, toast, setSelectedIds])

  const handleEditUser = useCallback(async (id) => {
    try { const user = await getUserWithId(id)
      router.push(`/admin/dashboard/users/${id}/edit`)
    } catch { toast.error("Failed to load user data")}
  }, [toast])

  const handleDeleteUser = useCallback(async (id) => {
    if (!confirm("Delete this user?")) return
    try { await deleteUserWithId(id)
      toast.success("User deleted")
      setSelectedIds((prev) => prev.filter((x) => x !== id))
    } catch { toast.error("Failed to delete user")}
  }, [toast, setSelectedIds])

  const onExportPDF = useCallback((data) => { exportUser(data)
    toast.success("PDF exported")
  }, [toast])

  return {
    toggleSelect, selectAll, isAllSelected, 
    deleteSelected, deleteAll,
    handleEditUser, handleDeleteUser,
    onExportPDF,
  }
}
