"use client"

import { useEffect } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Button } from "@/_components/ui/Button"

import EmptyStates from "@/_components/common/EmptyStates"

import LocationsActionHeader from "./LocationsActionHeader"
import LocationRow from "./LocationsRow"
import LocationStatusChanger from "./LocationsStatusChanger"

import { useLocationsHooks } from "@/_clients/hooks/admin/useLocationsHooks"
import { useLocationStore } from "@/_stores/useLocationStore"

export default function LocationsTable({ data }) {
  const {
    mutate, search, setSearch,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    filteredData, selectedIds,
    toggleSelect, selectAll,
    handleDeleteSelected, handleDeleteAll,
    handleActivateSelected, handleInactivateSelected,
    handleEditLocation, handleDeleteLocation, onToggleStatus, onToggleType,
    onBulkGlobalUpdate,
  } = useLocationsHooks(data)

  const {
    allActive, confirmOpen, pendingStatus, fetchConfig,
    handleBulkToggle, confirmBulkToggle, closeDialog,
  } = useLocationStore()

  useEffect(() => { fetchConfig() }, [fetchConfig])

  return (
    <>
      <LocationStatusChanger
        allActive={allActive}
        selectedCount={selectedIds.length}
        onToggleAll={handleBulkToggle}
        onActivateSelected={handleActivateSelected}
        onInactivateSelected={handleInactivateSelected}
      />

      <LocationsActionHeader
        search={search} onSearchChange={setSearch}
        typeFilter={typeFilter} onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
        onDeleteSelected={handleDeleteSelected} onDeleteAll={handleDeleteAll}
        filteredData={filteredData}
      />

      <div className="rounded-md overflow-hidden mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="flex items-center">
                <Checkbox checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                  onCheckedChange={selectAll}
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
                <LocationRow
                  key={division.id}
                  division={division}
                  isSelected={selectedIds.includes(division.id)}
                  onSelect={() => toggleSelect(division.id)}
                  onToggleStatus={onToggleStatus}
                  onToggleType={onToggleType}
                  onEdit={handleEditLocation}
                  onDelete={handleDeleteLocation}
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
