"use client"

import { useRef } from "react"

import UsersActionHeader from "../users/UsersActionHeader"
import { useUsersHooks } from "@/_clients/hooks/admin/useUsersHooks"
import ShiftAssignmentTable from "./ShiftAssignmentTable"

export default function ShiftAssignment({ users }) {
	const searchInputRef = useRef(null)

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

	return (
		<div className="space-y-4">
			<UsersActionHeader
				search={search}
				onSearchChange={handleSearchChange}
				shiftFilter={shiftFilter}
				onShiftFilterChange={handleShiftFilterChange}
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
