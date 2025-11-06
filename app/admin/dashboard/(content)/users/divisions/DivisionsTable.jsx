"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { AlarmClock, Loader, Building2 } from "lucide-react"

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
import { useDivisionsHooks } from "@/_function/hooks/useDivisionsHooks"
import EmptyStates from "@/_components/content/EmptyStates"
import { apiFetchData } from "@/_function/helpers/fetch"

export default function DivisionsTable({ data }) {
  const {
    mutate,
    search, setSearch,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    filteredData,
    selectedIds, toggleSelect, toggleSelectAll,
    handleDeleteSelected,
    handleDeleteAll,
    handleExportPDF,
    onEdit, onDelete, onToggleStatus, onBulkUpdate,
  } = useDivisionsHooks(data)

  const [allActive, setAllActive] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await apiFetchData({ url: "/system-config", method: "get",
          successMessage: null, useCache: true,
        })
        setAllActive(data.allWfaActive)
      } 
      catch (err) { console.error("❌ Failed to fetch config:", err)} 
      finally { setLoadingConfig(false)}
    }
    fetchConfig()
  }, [])

  const handleBulkToggle = () => { const newStatus = !allActive
    setPendingStatus(newStatus)
    setConfirmOpen(true)
  }

  const confirmBulkToggle = async () => {
    setAllActive(pendingStatus)
    setConfirmOpen(false)

    try {
      await apiFetchData({ url: "/system-config", method: "patch", data: { allWfaActive: pendingStatus },
        successMessage: "Configuration updated successfully",
        errorMessage: "Failed to update configuration",
      })

      await onBulkUpdate({
        activateType: "WFA", deactivateType: "WFO",
        isActive: pendingStatus,
      })
      mutate && mutate()
    } 
    catch (err) {
      console.error("❌ Error confirming bulk toggle:", err)
    }
  }

  if (loadingConfig) {
    return (
      <p className="flex items-center gap-x-1 text-sm text-slate-500">
        <Loader size={14} className="animate-spin" />
        Loading offices...
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Switch id="bulk-toggle" checked={allActive} onCheckedChange={handleBulkToggle} />
          <Label htmlFor="bulk-toggle" className="text-sm text-slate-600">
            Set All WFA Active / WFO Inactive
          </Label>
        </div>

        <DivisionsActionHeader
          search={search} onSearchChange={setSearch}
          typeFilter={typeFilter} onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
          onDeleteSelected={handleDeleteSelected} onDeleteAll={handleDeleteAll}
          onExportPDF={handleExportPDF} filteredData={filteredData}
        />

        <div className="rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] text-center">
                  <Checkbox checked={filteredData.length > 0 && selectedIds.length === filteredData.length} onCheckedChange={toggleSelectAll}/>
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
                <TableRow><EmptyStates /></TableRow>
              ) : (
                filteredData.map((division) => (
                  <TableRow key={division.id}>
                    <TableCell className="text-center">
                      <Checkbox checked={selectedIds.includes(division.id)} onCheckedChange={() => toggleSelect(division.id)}/>
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
                        <div className="p-2 text-yellow-700 bg-yellow-500/15 rounded-full">
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Activate</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {pendingStatus ? "Are you sure you want to activate all WFA and inactivate all WFO?"
              : "Are you sure you want to deactivate all WFA and activate all WFO?"}
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkToggle}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
