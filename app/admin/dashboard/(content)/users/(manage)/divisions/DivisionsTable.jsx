"use client"

import { useEffect } from "react"
import { Loader } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Button } from "@/_components/ui/Button"

import EmptyStates from "@/_components/common/EmptyStates"

import DivisionsActionHeader from "./DivisionsActionHeader"
import DivisionRow from "./DivisionsRow"
import DivisionStatusChanger from "./DivisionsStatusChanger"

import { useDivisionsHooks } from "@/_client/hooks/useDivisionsHooks"
import { useDivisionStore } from "@/_stores/useDivisionStore"

export default function DivisionsTable({ data }) {
  const {
    mutate, search, setSearch,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    filteredData, selectedIds,
    toggleSelect, toggleSelectAll,
    handleDeleteSelected, handleDeleteAll,
    handleActivateSelected, handleInactivateSelected,
    onEdit, onDelete, onToggleStatus,
    onBulkGlobalUpdate,
  } = useDivisionsHooks(data)

  const {
    allActive, confirmOpen, pendingStatus, loading, fetchConfig,
    handleBulkToggle, confirmBulkToggle, closeDialog,
  } = useDivisionStore()

  useEffect(() => {fetchConfig()}, [fetchConfig])
  if (loading) { return (
    <p className="flex items-center gap-x-1 text-sm text-slate-500">
      <Loader size={14} className="animate-spin" /> Loading division...
    </p>
  )}

  return (
    <>
      <DivisionStatusChanger
        allActive={allActive}
        selectedCount={selectedIds.length}
        onToggleAll={handleBulkToggle}
        onActivateSelected={handleActivateSelected}
        onInactivateSelected={handleInactivateSelected}
      />

      <DivisionsActionHeader
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onDeleteSelected={handleDeleteSelected}
        onDeleteAll={handleDeleteAll}
        filteredData={filteredData}
      />

      <div className="rounded-md overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox checked={filteredData.length > 0 &&
                    selectedIds.length === filteredData.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Work Hours</TableHead>
              <TableHead>Created & Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <EmptyStates />
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((division) => (
                <DivisionRow key={division.id} division={division}
                  checked={selectedIds.includes(division.id)}
                  onCheck={() => toggleSelect(division.id)} 
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={confirmOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Activate</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-600">
            {pendingStatus
              ? "Are you sure you want to activate all WFA and inactivate all WFO?"
              : "Are you sure you want to deactivate all WFA and activate all WFO?"}
          </p>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={() => confirmBulkToggle(onBulkGlobalUpdate, mutate)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
