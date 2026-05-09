"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useRef } from "react"

import UsersActionHeader from "../users/UsersActionHeader"
import { useUsersHooks } from "@/_clients/hooks/admin/useUsersHooks"
import ShiftAssignmentTable from "./ShiftAssignmentTable"

export default function ShiftAssignment({ users }) {
	const searchInputRef = useRef(null)
	const router = useRouter()
	const searchParams = useSearchParams()

	const currentStatus = searchParams.get("status") || "all"

	const {
		search, shiftFilter,
		filteredData,
		selectedIds,
		handleSearchChange,
		handleShiftFilterChange,
		toggleSelect,
		selectAll,
		deleteSelected,
		deleteAll,
	} = useUsersHooks(users)

	const handleStatusFilterChange = (newStatus) => {
		const params = new URLSearchParams(searchParams.toString())
		if (newStatus === "all") {
			params.delete("status")
		} else {
			params.set("status", newStatus)
		}
		params.set("page", "1") // Reset to first page on filter change
		router.push(`?${params.toString()}`)
	}

	return (
		<div className="space-y-4">
			<UsersActionHeader
				search={search}
				onSearchChange={handleSearchChange}
				shiftFilter={shiftFilter}
				onShiftFilterChange={handleShiftFilterChange}
				statusFilter={currentStatus}
				onStatusFilterChange={handleStatusFilterChange}
				selectedCount={selectedIds.length}
				onDeleteSelected={deleteSelected}
				onDeleteAll={deleteAll}
				filteredData={filteredData}
				searchInputRef={searchInputRef}
			/>

			<ShiftAssignmentTable
				users={filteredData}
				selectedIds={selectedIds}
				onToggleSelect={toggleSelect}
				onSelectAll={selectAll}
			/>
		</div>
	)
}
