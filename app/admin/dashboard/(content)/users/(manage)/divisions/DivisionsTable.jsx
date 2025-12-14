"use client"

import { useEffect } from "react"
import { Loader, Building2, AlarmClock, Check, X } from "lucide-react"
import { format } from "date-fns"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Badge } from "@/_components/ui/Badge"
import { Button } from "@/_components/ui/Button"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Switch } from "@/_components/ui/Switch"
import { Label } from "@/_components/ui/Label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"

import { divisionStyles } from "@/_constants/divisionConstants"
import { DivisionsStatusBadge } from "./DivisionsStatusBadge"
import { DivisionsActionHeader } from "./DivisionsActionHeader"
import { useDivisionsHooks } from "@/_client/hooks/useDivisionsHooks"
import EmptyStates from "@/_components/common/EmptyStates"

import { useDivisionStore } from "@/_stores/useDivisionStore"

export default function DivisionsTable({ data }) {
  const {
    mutate, search, setSearch,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    filteredData,
    selectedIds, toggleSelect, toggleSelectAll,
    handleDeleteSelected,
    handleDeleteAll,
    onEdit, onDelete, onToggleStatus, onBulkGlobalUpdate, onBulkUpdate,
  } = useDivisionsHooks(data)

  const {
    allActive,
    confirmOpen,
    pendingStatus,
    loading,
    fetchConfig,
    handleBulkToggle, confirmBulkToggle,
    closeDialog,
  } = useDivisionStore()

  useEffect(() => { fetchConfig() }, [fetchConfig])

  if (loading) {
    return (
      <p className="flex items-center gap-x-1 text-sm text-slate-500">
        <Loader size={14} className="animate-spin" /> Loading division...
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Switch id="bulk-toggle" checked={allActive} onCheckedChange={handleBulkToggle} />
            <div className="flex flex-col">
              <Label htmlFor="bulk-toggle" className="text-sm text-slate-600">Toggle Division</Label>
              <span className="text-xs text-slate-400">Set all Division status Active or Inactive</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Button size="sm"
              variant="outline" className="text-xs rounded-full" disabled={selectedIds.length === 0}
              onClick={() => onBulkUpdate(selectedIds, "ACTIVE")}
            >
              <Check className="text-teal-600" />
              Activate Selected
            </Button>

            <Button size="sm"
              variant="outline" className="text-xs rounded-full" disabled={selectedIds.length === 0}
              onClick={() => onBulkUpdate(selectedIds, "INACTIVE")}
            >
              <X className="text-rose-600" />
              Inactivate Selected
            </Button>
          </div>
        </div>

        <DivisionsActionHeader
          search={search} onSearchChange={setSearch}
          typeFilter={typeFilter} onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
          onDeleteSelected={handleDeleteSelected} onDeleteAll={handleDeleteAll}
          filteredData={filteredData}
        />

        <div className="rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] flex items-center">
                  <Checkbox checked={filteredData.length > 0 && selectedIds.length === filteredData.length} onCheckedChange={toggleSelectAll} />
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
                <TableRow><TableCell colSpan={7} className="w-10 text-center text-slate-400"><EmptyStates /></TableCell></TableRow>
              ) : (
                filteredData.map((division) => (
                  <TableRow key={division.id}>
                    <TableCell className="w-[20px] text-center">
                      <Checkbox checked={selectedIds.includes(division.id)} onCheckedChange={() => toggleSelect(division.id)} />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-200 p-2 rounded-full">
                          <Building2 className="h-5 w-5 text-slate-600" strokeWidth={1} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">{division.name}</p>
                          <p className="text-xs text-slate-400">{division.location}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={divisionStyles[division.type]}>
                        {division.type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <DivisionsStatusBadge status={division.status} onToggle={() => onToggleStatus(division)} />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="p-2 text-amber-700 bg-amber-500/15 rounded-full">
                          <AlarmClock size={14} strokeWidth={1.5} />
                        </div>
                        <span>
                          {division.startTime && division.endTime ? `${division.startTime} - ${division.endTime}` : "-"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-600">
                          {format(new Date(division.createdAt), "dd MMMM yyyy")}
                        </span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(division.updatedAt), "dd MMMM yyyy")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onEdit(division.id)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(division.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
            <Button onClick={() => confirmBulkToggle(onBulkGlobalUpdate, mutate)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
