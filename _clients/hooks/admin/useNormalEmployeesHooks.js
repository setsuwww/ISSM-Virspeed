"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/_lib/api"
import { useConfirmStore } from "@/_stores/common/useConfirmStore"
import { confirmMessages } from "@/_constants/static/handleEmployeeMessage"
import { deleteUserById } from "@/_servers/admin-action/userAction"

const askConfirm = useConfirmStore.getState().ask

export function useNormalEmployeesHooks(users = []) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState([])
  const [divisionFilter, setDivisionFilter] = useState("all")

  const router = useRouter()

  const data = useMemo(() => {
    return users.filter((u) => u.role === "EMPLOYEE")
  }, [users])

  const filteredData = useMemo(() => {
    return data.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())

      const matchDivision =
        divisionFilter === "all" ||
        String(u.division?.id) === divisionFilter

      return matchSearch && matchDivision
    })
  }, [data, search, divisionFilter])

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const deleteSelected = async () => {
    if (!selected.length) return

    const { message, variant } =
      confirmMessages.deleteSelected(selected.length)

    const confirmed = await askConfirm(message, variant)
    if (!confirmed) return

    await Promise.all(selected.map((id) => api.delete(`/users/${id}`)))
    setSelected([])
  }

  const onEdit = useCallback(
    (id) => router.push(`/admin/dashboard/users/${id}/edit`),
    [router]
  )

  const onHistory = useCallback(
    (id) => router.push(`/admin/dashboard/users/${id}/history`),
    [router]
  )

  const onDelete = useCallback(async (id) => {
    const { message, variant } = confirmMessages.deleteOne
    const confirmed = await askConfirm(message, variant)
    if (!confirmed) return
    await deleteUserById(id)
  }, [])

  return {
    search,
    setSearch,
    selected,
    setSelected,

    data,
    filteredData,

    divisionFilter,
    setDivisionFilter,

    toggleSelect,
    deleteSelected,

    onHistory,
    onEdit,
    onDelete,
  }
}
